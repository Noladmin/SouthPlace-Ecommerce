import PDFDocument from 'pdfkit'
import { OrderEmailPayload } from './email-service'
import path from 'path'
import fs from 'fs'

interface InvoiceOptions {
  includeLogo?: boolean
  logoPath?: string
  companyInfo?: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    vatNumber?: string
  }
}

const defaultCompanyInfo = {
  name: "South Place",
  address: "Lagos, Nigeria",
  phone: "+44 (0) 123 456 7890",
  email: "orders@tastybowls.com",
  website: "www.tastybowls.com"
}

export class InvoiceService {
  private options: InvoiceOptions

  constructor(options: InvoiceOptions = {}) {
    this.options = {
      includeLogo: true,
      logoPath: process.cwd() + "/public/images/SouthLogo.png",
      companyInfo: defaultCompanyInfo,
      ...options
    }
    // Set the correct font path for PDFKit
    const pdfkitPath = path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data')
    process.env.PDFKIT_FONT_PATH = pdfkitPath

    // Fix PDFKit font path issue by copying fonts to expected location
    try {
      const sourceFontPath = path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data')
      const targetFontPath = path.join(process.cwd(), '.next', 'server', 'vendor-chunks', 'data')
      
      // Create target directory if it doesn't exist
      if (!fs.existsSync(targetFontPath)) {
        fs.mkdirSync(targetFontPath, { recursive: true })
      }
      
      // Copy font files if they don't exist in target
      const fontFiles = ['Helvetica.afm', 'Helvetica-Bold.afm', 'Courier.afm', 'Courier-Bold.afm']
      fontFiles.forEach(fontFile => {
        const sourceFile = path.join(sourceFontPath, fontFile)
        const targetFile = path.join(targetFontPath, fontFile)
        
        if (fs.existsSync(sourceFile) && !fs.existsSync(targetFile)) {
          fs.copyFileSync(sourceFile, targetFile)
        }
      })
    } catch (error) {
      console.warn('Could not copy font files:', error)
    }
  }

  async generateInvoice(order: OrderEmailPayload): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Starting PDF generation for order:', order.orderNumber)
        
        // Validate order data
        if (!order || !order.orderNumber) {
          throw new Error('Invalid order data provided')
        }
        
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        })

        const chunks: Buffer[] = []
        doc.on('data', (chunk: Buffer) => chunks.push(chunk))
        doc.on('end', () => {
          console.log('PDF generation completed successfully for order:', order.orderNumber)
          resolve(Buffer.concat(chunks))
        })
        doc.on('error', (error) => {
          console.error('PDF generation error for order:', order.orderNumber, error)
          reject(error)
        })

        try {
          this.renderInvoice(doc, order)
          doc.end()
        } catch (renderError) {
          console.error('Error during invoice rendering for order:', order.orderNumber, renderError)
          doc.end()
          reject(renderError)
        }
      } catch (error) {
        console.error('PDF generation failed for order:', order.orderNumber, error)
        reject(error)
      }
    })
  }

  private renderInvoice(doc: PDFKit.PDFDocument, order: OrderEmailPayload) {
    // Validate required order data
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      throw new Error('Order items are required for invoice generation')
    }
    
    if (!order.customerName || !order.deliveryAddress) {
      throw new Error('Customer information is required for invoice generation')
    }
    
    // Header
    this.renderHeader(doc)
    
    // Invoice details
    this.renderInvoiceDetails(doc, order)
    
    // Customer information
    this.renderCustomerInfo(doc, order)
    
    // Order items table
    this.renderItemsTable(doc, order)
    
    // Totals
    this.renderTotals(doc, order)
    
    // Payment information
    this.renderPaymentInfo(doc, order)
    
    // Footer
    this.renderFooter(doc)
  }

  private renderHeader(doc: PDFKit.PDFDocument) {
    const companyInfo = this.options.companyInfo!
    
    // Company logo (if available)
    if (this.options.includeLogo && this.options.logoPath) {
      try {
        doc.image(this.options.logoPath, 50, 50, { width: 60, height: 60 })
        console.log('Logo loaded successfully for invoice')
      } catch (error) {
        console.warn('Logo not found or failed to load, skipping image:', error)
        // Disable logo for this generation to prevent future failures
        this.options.includeLogo = false
        // Continue without logo - don't let this break the PDF generation
      }
    }

    // Company name and details
    doc.fontSize(24)
      .fillColor('#387237')
      .text(companyInfo.name || 'South Place', 120, 60)

    doc.fontSize(10)
      .fillColor('#666666')
      .text(companyInfo.address || 'Lagos, Nigeria', 120, 90)
      .text(`Phone: ${companyInfo.phone || '+44 (0) 123 456 7890'}`, 120, 105)
      .text(`Email: ${companyInfo.email || 'orders@tastybowls.com'}`, 120, 120)
      
    if (companyInfo.website) {
      doc.text(`Website: ${companyInfo.website}`, 120, 135)
    }

    // Invoice title
    doc.fontSize(18)
      .fillColor('#000000')
      .text('INVOICE', 400, 60, { align: 'right' })
  }

  private renderInvoiceDetails(doc: PDFKit.PDFDocument, order: OrderEmailPayload) {
    const y = 200
    
    doc.fontSize(12)
      .fillColor('#000000')
      .text('Invoice Details', 50, y)

    doc.fontSize(10)
      .fillColor('#666666')
      .text(`Invoice Number: ${order.orderNumber || 'N/A'}`, 50, y + 20)
      .text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-NG') : 'N/A'}`, 50, y + 35)
      .text(`Order ID: ${order.id || 'N/A'}`, 50, y + 50)
  }

  private renderCustomerInfo(doc: PDFKit.PDFDocument, order: OrderEmailPayload) {
    const y = 300
    
    doc.fontSize(12)
      .fillColor('#000000')
      .text('Bill To:', 50, y)

    doc.fontSize(10)
      .fillColor('#666666')
      .text(order.customerName || 'Unknown Customer', 50, y + 20)
      .text(order.deliveryAddress || 'No address provided', 50, y + 35)
      
    if (order.customerEmail) {
      doc.text(`Email: ${order.customerEmail}`, 50, y + 50)
    }
    
    if (order.customerPhone) {
      doc.text(`Phone: ${order.customerPhone}`, 50, y + 65)
    }
  }

  private renderItemsTable(doc: PDFKit.PDFDocument, order: OrderEmailPayload) {
    const y = 450
    const tableTop = y + 30
    
    // Table header
    doc.fontSize(10)
      .fillColor('#ffffff')
      .rect(50, tableTop, 500, 25)
      .fill()
      .fillColor('#000000')
      .text('Item', 60, tableTop + 8)
      .text('Qty', 300, tableTop + 8)
      .text('Price', 380, tableTop + 8)
      .text('Total', 450, tableTop + 8)

    // Table rows
    let currentY = tableTop + 25
    order.items?.forEach((item: any, index: number) => {
      const extrasLabel = item.extras && item.extras.length
        ? `Extras: ${item.extras.map((ex: any) => ex.name).join(", ")}`
        : ""
      const rowHeight = extrasLabel ? 40 : 25
      
      // Validate item data
      if (!item || !item.name || typeof item.quantity !== 'number' || typeof item.price !== 'number') {
        console.warn('Skipping invalid item in invoice:', item)
        return
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.fillColor('#f8f9fa')
          .rect(50, currentY, 500, rowHeight)
          .fill()
      }
      
      doc.fillColor('#000000')
        .fontSize(9)
        .text(item.name || 'Unknown Item', 60, currentY + 8)
        .text(item.variant || '', 60, currentY + 20, { width: 230 })
        .text((item.quantity || 0).toString(), 300, currentY + 8)
        .text(`₦${(item.price || 0).toFixed(2)}`, 380, currentY + 8)
        .text(`₦${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`, 450, currentY + 8)

      if (extrasLabel) {
        doc.fillColor('#666666')
          .fontSize(8)
          .text(extrasLabel, 60, currentY + 30, { width: 230 })
      }
      
      currentY += rowHeight
    })

    // Table bottom border
    doc.strokeColor('#dee2e6')
      .lineWidth(1)
      .moveTo(50, currentY)
      .lineTo(550, currentY)
      .stroke()
  }

  private renderTotals(doc: PDFKit.PDFDocument, order: OrderEmailPayload) {
    const y = 700
    
    const lines = [
      { label: 'Subtotal:', value: order.subtotal || 0 },
      { label: 'Delivery Fee:', value: order.deliveryFee || 0 },
    ]
    if ((order.vatAmount || 0) > 0) {
      lines.push({ label: `VAT${order.vatRate ? ` (${order.vatRate.toFixed(2)}%)` : ""}:`, value: order.vatAmount || 0 })
    }
    lines.push({ label: 'Total:', value: order.total || 0 })

    doc.fontSize(10).fillColor('#666666')
    lines.forEach((line, idx) => {
      doc.text(line.label, 400, y + (idx * 20), { align: 'right' })
    })

    doc.fontSize(10).fillColor('#000000')
    lines.forEach((line, idx) => {
      doc.text(`₦${(line.value || 0).toFixed(2)}`, 500, y + (idx * 20), { align: 'right' })
    })

    // Total box
    const totalBoxY = y + ((lines.length - 1) * 20) + 5
    doc.strokeColor('#387237')
      .lineWidth(2)
      .rect(380, totalBoxY, 150, 30)
      .stroke()
  }

  private renderPaymentInfo(doc: PDFKit.PDFDocument, order: OrderEmailPayload) {
    const y = 780
    
    doc.fontSize(10)
      .fillColor('#000000')
      .text('Payment Information:', 50, y)

    doc.fontSize(9)
      .fillColor('#666666')
      .text(`Payment Method: ${order.paymentMethod || 'N/A'}`, 50, y + 20)
      .text(`Payment Status: ${order.paymentStatus || 'Paid'}`, 50, y + 35)
      
    if (order.paymentIntentId) {
      doc.text(`Payment Reference: ${order.paymentIntentId}`, 50, y + 50)
    }
    
    if (order.estimatedDelivery) {
      doc.text(`Estimated Delivery: ${order.estimatedDelivery}`, 50, y + 65)
    }
  }

  private renderFooter(doc: PDFKit.PDFDocument) {
    const y = 900
    
    doc.fontSize(8)
      .fillColor('#999999')
      .text('Thank you for your business!', 50, y, { align: 'center' })
      .text('This is a computer-generated invoice. No signature required.', 50, y + 15, { align: 'center' })
      .text('For questions, please contact us at southplacecatering@gmail.com', 50, y + 30, { align: 'center' })
  }

  async generateAndSaveInvoice(order: OrderEmailPayload, filename?: string): Promise<{ buffer: Buffer; filename: string }> {
    const buffer = await this.generateInvoice(order)
    const invoiceFilename = filename || `invoice-${order.orderNumber}-${Date.now()}.pdf`
    
    return { buffer, filename: invoiceFilename }
  }
}

export const invoiceService = new InvoiceService()
