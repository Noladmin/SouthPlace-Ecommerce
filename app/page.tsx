'use client';

import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/UI/Hero';
import FeaturedDishes from '@/components/featured-dishes';
import { FaUtensils, FaBroom, FaTshirt, FaClock, FaUsers, FaConciergeBell, FaStar, FaAward, FaQuoteLeft, FaCalendarAlt } from 'react-icons/fa';

export default function Home() {
  const clients = [
    {
      name: 'National Engineering and Technical Company (NETCO)',
      logo: '/icons/netco.jpg',
      featured: true
    },
    {
      name: 'Drilling Equipment Supply Nigeria Limited',
      logo: null,
      featured: false
    },
    {
      name: 'Lekki Free Port Terminal',
      logo: '/icons/LekkiPort.png',
      featured: false
    },
    {
      name: '4mation Drilling Services Ltd',
      logo: '/icons/4mation.png',
      featured: false
    },
    {
      name: 'Vicbriggs Nig Ltd',
      logo: '/icons/Vic.JPG',
      featured: false
    },
    {
      name: 'OES Energy Services',
      logo: '/icons/oeslogo.png',
      featured: false
    },
    {
      name: 'Platform Petroleum Ltd',
      logo: '/icons/platformpet-logo2.png',
      featured: false
    }
  ];

  const heroStats = [
    {
      icon: FaClock,
      value: '8',
      label: 'Years of Operations',
      variant: 'dark' as const
    },
    {
      icon: FaUsers,
      value: '9534+',
      label: 'Satisfied Customers',
      variant: 'cream' as const
    },
    {
      icon: FaConciergeBell,
      value: '100+',
      label: 'Popular Menu Items',
      variant: 'white' as const
    },
    {
      icon: FaStar,
      value: '932+',
      label: 'Online Orders',
      variant: 'dark' as const
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
              <Hero
                title="Order South Place Favorites"
                description="Fresh, flavorful meals made for you. Choose your dishes, add to cart, and checkout in minutes."
                backgroundImages={[
                  "/images/food1.webp",
                  "/images/food2.webp", 
                  "/images/food3.webp",
                  "/images/catering2.webp",
                  "/images/waiter1.webp",
                  "/images/waiter2.webp",
                  "/images/cutlery1.webp"
                ]}
                buttonText="Order Now"
                buttonLink="/order"
                secondaryButtonText="View Menu"
                secondaryButtonLink="/menu"
                showStats={true}
                stats={heroStats}
              />

      {/* Order First Section */}
      <section className="py-20 bg-gradient-to-b from-orange-50/60 via-white to-orange-100/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-600/10 px-4 py-1.5 text-sm font-semibold text-orange-700 border border-orange-200">
              Popular Right Now
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-3">
              Start With These Favorites
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Quick menu picks to get customers ordering fast.
            </p>
          </div>

          <FeaturedDishes />

          <div className="mt-8 text-center">
            <Link href="/menu" className="inline-flex items-center justify-center rounded-lg border border-orange-300 bg-white px-6 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50 transition-colors">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview Section - Bento Grid */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <div
            className="text-center mb-20"
          >
            <div className="inline-block mb-4">
              <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide">
              <span className="text-orange-500 font-medium">Our</span>{' '}
              <span className="text-gray-800">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Comprehensive solutions tailored to meet your specific needs across various industries
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-6">
            {/* Left: Industrial Catering - Large Image Card (Full Height) */}
            <div
              className="md:col-span-1 md:row-span-2 relative overflow-hidden rounded-3xl group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:scale-[1.02]"
            >
              <Link href="/services/industrial-catering">
                <div className="relative h-[400px] sm:h-[450px] md:h-full md:min-h-[600px]">
                  <Image
                    src="/images/catering2.webp"
                    alt="Industrial Catering"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 text-white">
                    <div className="bg-orange-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <FaUtensils className="text-2xl text-orange-300" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-light mb-3 tracking-wide">Industrial Catering</h3>
                    <p className="text-base sm:text-lg text-gray-200 mb-6 leading-relaxed font-light">Professional catering services for industrial facilities, ensuring nutritious meals for your workforce.</p>
                    <div className="flex items-center text-orange-300 font-medium group-hover:text-orange-200 transition-colors">
                      <span className="text-lg">Learn More</span>
                      <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Top Right: Office Catering - Image Card */}
            <div
              className="md:col-span-1 md:row-span-1 rounded-2xl md:rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-2xl"
            >
              <Link href="/services/office-catering" className="block h-full">
                <div className="relative h-full min-h-[200px] sm:min-h-[250px] md:min-h-[280px]">
                  <Image
                    src="/images/food3.webp"
                    alt="Office Catering"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  <div className="absolute inset-0 p-5 sm:p-6 md:p-8 flex flex-col justify-between">
                    <div className="bg-orange-500/20 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
                      <FaCalendarAlt className="text-xl sm:text-2xl md:text-3xl text-orange-300" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Office Catering</h3>
                      <p className="text-gray-200 text-sm sm:text-base mb-3 md:mb-4">Professional catering for office lunches and corporate year-end parties.</p>
                      <div className="flex items-center text-orange-300 font-semibold text-sm md:text-base">
                        <span>Learn More</span>
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Top Right: Housekeeping - Card with Image */}
            <div
              className="md:col-span-1 md:row-span-1 relative overflow-hidden rounded-2xl md:rounded-3xl group cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
            >
              <Link href="/services/house-keeping">
                <div className="relative h-[200px] sm:h-[250px] md:h-full md:min-h-[280px]">
                  <Image
                    src="/images/housekeeping1.webp"
                    alt="Housekeeping"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white">
                    <FaBroom className="text-2xl sm:text-3xl md:text-4xl text-orange-400 mb-2 md:mb-3" />
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 md:mb-2">Housekeeping</h3>
                    <p className="text-xs sm:text-sm text-gray-200 mb-2 md:mb-3">Professional housekeeping services maintaining the highest standards.</p>
                    <div className="flex items-center text-orange-400 font-semibold text-sm">
                      <span>Learn More</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Bottom Right: Laundry Services - Large Image Card */}
            <div
              className="md:col-span-2 md:row-span-1 relative overflow-hidden rounded-2xl md:rounded-3xl group cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
            >
              <Link href="/services/laundry-services">
                <div className="relative h-[300px] sm:h-[350px] md:h-[400px]">
            <Image
                    src="/images/laundery.webp"
                    alt="Laundry Services"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8 text-white">
                    <FaTshirt className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-orange-400 mb-2 sm:mb-3 md:mb-4" />
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 md:mb-3">Laundry Services</h3>
                    <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-2 sm:mb-3 md:mb-4">Efficient laundry and linen management services for hotels, hospitals, and corporate facilities.</p>
                    <div className="flex items-center text-orange-400 font-semibold">
                      <span>Learn More</span>
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <div
            className="text-center mb-20"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide">
              <span className="text-orange-500 font-medium">Our Mission</span>{' '}
              <span className="text-gray-800">&</span>{' '}
              <span className="text-orange-500 font-medium">Vision</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Committed to excellence in every aspect of our service
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Mission Card */}
            <div
              className="relative"
            >
              {/* Circle on Left */}
              <div className="absolute -left-16 -top-8 w-36 h-36 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl z-10">
                <FaConciergeBell className="text-5xl text-white" />
              </div>
              
              {/* Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-12 pl-20 md:pl-24 hover:shadow-3xl transition-all duration-500 relative h-full min-h-[320px] border border-gray-100">
                <h3 className="text-4xl font-light text-gray-900 mb-8 tracking-wide">Our Mission</h3>
                <p className="text-xl text-gray-700 leading-relaxed font-light">
                  We provide high quality, cost effective catering services tailored to the unique demand of our industrial clients.
                </p>
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-base text-gray-500 italic font-light">Building lasting relationships through exceptional service</p>
                </div>
              </div>
            </div>

            {/* Vision Card */}
            <div
              className="relative"
            >
              {/* Circle - Left on mobile, Right on desktop */}
              <div className="absolute -left-16 -top-8 md:-right-16 md:-top-8 w-36 h-36 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl z-10">
                <FaStar className="text-5xl text-white" />
              </div>
              
              {/* Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-10 md:p-12 pl-20 md:pl-12 pr-4 md:pr-24 hover:shadow-3xl transition-all duration-500 relative h-full min-h-[320px] border border-gray-700">
                <h3 className="text-4xl font-light text-white mb-8 tracking-wide">Our Vision</h3>
                <p className="text-xl text-gray-300 leading-relaxed mb-8 font-light">
                  To be the most trusted industrial catering partner in Africa, delivering nutritious and hygienic meal solutions that empowers work force, productivity and well being.
                </p>
                <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-600">
                  <div className="text-center">
                    <div className="text-4xl font-light text-orange-400 mb-2">8</div>
                    <div className="text-sm text-gray-400 font-light">Years Operations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-light text-orange-400 mb-2">9534+</div>
                    <div className="text-sm text-gray-400 font-light">Happy Clients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div
            className="bg-white rounded-3xl shadow-lg p-8 md:p-10"
          >
            <div className="text-center mb-8">
              <div className="inline-block mb-6">
                <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
              </div>
              <h3 className="text-4xl font-light text-gray-900 mb-6 tracking-wide">
                <span className="text-orange-500 font-medium">Our Core</span>{' '}
                <span className="text-gray-800">Values</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-100 p-4 rounded-full mb-4">
                  <FaUtensils className="text-3xl text-orange-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Quality Excellence</h4>
                <p className="text-gray-600">Delivering premium services that exceed expectations in every meal and service</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-100 p-4 rounded-full mb-4">
                  <FaUsers className="text-3xl text-orange-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Customer Focus</h4>
                <p className="text-gray-600">Putting our clients&apos; needs first with personalized attention and care</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-100 p-4 rounded-full mb-4">
                  <FaStar className="text-3xl text-orange-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Integrity & Trust</h4>
                <p className="text-gray-600">Operating with honesty, transparency, and the highest ethical standards</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Clients Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <div
            className="text-center mb-16"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide">
              <span className="text-orange-500 font-medium">Our Valued</span>{' '}
              <span className="text-gray-800">Clients</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Trusted by leading companies across Nigeria for over 8 years
            </p>
          </div>

          {/* Client Logos Professional Grid */}
          <div
            className="mb-16"
          >
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12 items-center">
                {clients.filter(client => client.logo).map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center group"
                  >
                    <div className="relative">
                      {client.logo && (
                        <Image
                          src={client.logo}
                          alt={`${client.name} Logo`}
                          width={120}
                          height={80}
                          className="object-contain max-h-16 md:max-h-20 w-auto opacity-60 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-12 shadow-xl border border-orange-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FaClock className="text-white text-2xl" />
                  </div>
                  <div className="text-5xl font-light text-orange-600 mb-2">8</div>
                  <div className="text-gray-700 font-medium">Years of Operations</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FaUsers className="text-white text-2xl" />
                  </div>
                  <div className="text-5xl font-light text-orange-600 mb-2">8+</div>
                  <div className="text-gray-700 font-medium">Major Clients</div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FaStar className="text-white text-2xl" />
                  </div>
                  <div className="text-5xl font-light text-orange-600 mb-2">100%</div>
                  <div className="text-gray-700 font-medium">Client Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/food1.webp"
            alt="Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16 relative z-10">
          <div
            className="text-center mb-16"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-300 to-orange-200 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-white mb-6 tracking-wide">
              <span className="text-orange-300 font-medium">Client</span>{' '}
              <span className="text-white">Testimonials</span>
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-light">
              Don&apos;t just take our word for it. Here&apos;s what our valued clients have to say about our services.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Single Testimonial Display */}
            <div className="overflow-hidden">
              <div
                className="bg-white p-12 rounded-2xl shadow-2xl"
              >
                <div className="flex items-center justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-2xl mx-1" />
                  ))}
                </div>
                <FaQuoteLeft className="text-orange-500 text-4xl mb-6 mx-auto" />
                <p className="text-xl text-gray-700 leading-relaxed mb-8 italic text-center max-w-3xl mx-auto">
                  &ldquo;South Place Catering has been an absolute pleasure to work with! Their staff canteen services have been a game-changer for our team. They&apos;ve been catering for over 700 people daily for 4 years without stress. The food is delicious, the service is top-notch, and their team is always willing to go above and beyond. We&apos;ve seen a significant boost in staff morale and satisfaction since they took over the canteen. We couldn&apos;t be happier with the service they&apos;ve provided and would highly recommend them to anyone looking for a reliable and exceptional catering partner.&rdquo;
                </p>
                <div className="text-center border-t border-gray-200 pt-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Ibiso Eteh</h4>
                  <p className="text-orange-600 font-semibold text-lg">HHR</p>
                  <p className="text-gray-500">Lekki Freeport Terminal, Ibeju Lekki</p>
                </div>
              </div>
            </div>

            <div
              className="text-center mt-12"
            >
              <Link href="/who-we-are/awards">
                <button
                  className="bg-orange-500 hover:bg-orange-400 text-black px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  View All Reviews & Awards
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 xl:px-16">
          <div
            className="text-center mb-20"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-wide">
              <span className="text-orange-500 font-medium">Awards</span>{' '}
              <span className="text-gray-800">& Recognition</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Recognized for excellence in catering and facilities management services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaAward,
                title: 'Excellence in Industrial Catering',
                organization: 'Nigerian Hospitality Association'
              },
              {
                icon: FaStar,
                title: 'Food Safety Excellence Award',
                organization: 'HACCP International'
              },
              {
                icon: FaAward,
                title: 'Best Corporate Catering Service',
                organization: 'Lagos Business Awards'
              },
              {
                icon: FaStar,
                title: 'Innovation in Facilities Management',
                organization: 'Nigerian Facilities Management Council'
              }
            ].map((award, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white rounded-2xl hover:bg-orange-50 transition-all duration-500 shadow-lg hover:shadow-xl border border-gray-100 hover:border-orange-200"
              >
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <award.icon className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-3 tracking-wide">{award.title}</h3>
                <p className="text-orange-600 font-medium text-base">{award.organization}</p>
              </div>
            ))}
          </div>

          <div
            className="text-center mt-12"
          >
            <Link href="/who-we-are/awards">
              <button
                className="bg-orange-500 hover:bg-orange-400 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
              >
                View All Awards & Reviews
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
