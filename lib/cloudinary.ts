import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Helper function to upload image to Cloudinary
export async function uploadToCloudinary(
  file: Buffer,
  filename: string,
  folder: string = 'tastybowls'
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
        resource_type: 'auto',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id
          })
        } else {
          reject(new Error('Upload failed'))
        }
      }
    ).end(file)
  })
}

// Helper function to delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}


