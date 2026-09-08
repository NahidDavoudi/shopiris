/**
 * store.config.js — fallback store settings (when API is unavailable)
 * Primary source: GET /settings — core/storeSettings.js
 */
export default {
  name: 'IRIS',
  logo: 'assets/images/logo.png',
  favicon: 'assets/images/logo.png',

  hero: {
    image: 'assets/images/hero.png',
    images: [
      { url: 'assets/images/hero.png', alt: 'IRIS', order: 1 },
    ],
    slider: {
      maxImages: 3,
      displayDurationMs: 5000,
      fadeDurationMs: 1000,
      kenBurnsScaleStart: 1.08,
      kenBurnsScaleEnd: 1.0,
    },
    title: 'IRIS',
    subtitle: 'Y2K clothing and unique long sleeves',
    ctaPrimary: 'Explore Collection',
    ctaSecondary: 'Categories',
  },

  feature: {
    image: 'assets/images/poster.png',
    title: 'MACHINED PERFECTION',
    description: 'Every piece is crafted with industrial precision — from heavyweight fabrics to chrome prints with an anatomical fit. Designed for those who notice details.',
    cta: 'View Archive',
    ctaHref: '#/shop',
    items: [
      { icon: 'layers', label: 'HEAVYWEIGHT COTTONS' },
      { icon: 'sparkles', label: 'SCREEN PRINTED CHROME' },
      { icon: 'scan', label: 'ANATOMICAL FIT' },
    ],
    card: {
      tag: 'ARCHIVE',
      title: 'Skull Tank — SS24',
      subtitle: 'Limited drop · 48 pieces',
    },
  },

  theme: {
    primary: '#000000',
    primaryHover: '#333333',
    background: '#ffffff',
    surface: '#f5f5f7',
    card: '#f0f0f2',
    border: '#d2d2d7',
    muted: '#86868b',
    textDim: 'rgba(0, 0, 0, 0.55)',
    bodyText: '#1d1d1f',
  },

  fonts: {
    body: 'Vazirmatn',
    display: 'Agbalumo',
    felipa: 'Felipa',
  },

  shipping: {
    freeFrom: 1500000,
    standardCost: 50000,
    minOrder: 0,
  },

  data: {
    iranLocations: 'assets/data/provinces_cities_counties.json',
  },

  payment: {
    cardNumber: '',
    cardOwner: '',
    method: 'card_to_card',
    unavailableMessage: 'Card information has not been set in the admin panel. Please contact support.',
  },

  enamad: {
    html: '',
  },

  ui: {
    cardRadius: 'rounded-[28px]',
    btnRadius: 'rounded-full',
    btnAluminum: 'btn-aluminum',
    btnGlass: 'btn-glass',
    btnPrimary: 'btn-aluminum',
    cardBase: 'bg-white border border-black/5',
    cardHover: 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-black/10 transition-all duration-500',
  },

  carousel: {
    featured: {
      viewAllHref: '#/shop?featured=1',
      speed: 1.5,
      gap: 16,
      direction: 'left',
      cardRadius: 12,
      backgroundColor: '#ffffff',
      height: 420,
      heightMd: 480,
      mobileBreakpoint: 600,
      tabletBreakpoint: 1024,
      pauseOnHover: true,
    },
  },

  auth: {
    smsOtpEnabled: false,
  },

  texts: {
    nav: [
      { href: '#/', label: 'Home' },
      { href: '#/shop', label: 'Shop' },
      { href: '#/categories', label: 'Categories' },
      { href: '#/orders', label: 'Orders' },
    ],

    home: {
      featured: 'Bestsellers',
      newest: 'Newest Products',
      viewAll: 'All',
    },

    shop: {
      allProducts: 'All Products',
      filtersTitle: 'Filters',
      sizeLabel: 'Size',
      colorLabel: 'Color',
      priceLabel: 'Price Range (Toman)',
      priceFromLabel: 'From',
      priceToLabel: 'To',
      priceBoundsHint: 'Min and max product price:',
      applyFilters: 'Apply Filters',
      clearFilters: 'Clear Filters',
      showMore: 'Show More',
      productsFound: 'product(s) found',
      loading: 'Loading...',
      empty: 'No products found.',
      emptyAction: 'Back',
      filterToggle: 'Filter',
      breadcrumbHome: 'Home',
      breadcrumbShop: 'Shop',
      pageSize: 8,
    },

    product: {
      loading: 'Loading...',
      refPrefix: 'REF:',
      sizeLabel: 'Size',
      sizeGuide: 'Size Guide',
      sizeGuideHref: '#',
      addToCart: 'Add to Cart',
      quickBuy: 'Buy Now',
      cardQuickBuy: 'Quick Buy',
      cardWishlist: 'Wishlist',
      outOfStock: 'Out of stock',
      addedToCart: 'Product added to cart',
      viewCart: 'View Cart',
      detailsTitle: 'Details & Composition',
      shippingTitle: 'Shipping & Returns',
      shippingText: 'Free shipping for orders over 1,500,000 Toman. Returns accepted within 7 days of delivery for unused products.',
      completeStyle: 'Complete the Look',
      viewAll: 'View All',
      defaultSizes: ['XS', 'S', 'M', 'L'],
      variantSetupIncomplete: 'Sizing and color options for this product are not yet complete. Please contact support.',
      selectVariant: 'Please select product options',
      variantRequired: 'Please select size/color on the product page first.',
      detailItems: [
        'High-quality print',
        'Raw edges and natural texture',
        'Machine wash cold, inside out',
      ],
    },

    footer: {
      tagline: 'IRIS — Y2K clothing and unique long sleeve store.',
      support: 'Support 7 days a week',
      social: '@iris',
      copyright: '© 2025 IRIS — All rights reserved',
    },

    auth: {
      registerSubmit: 'Sign Up',
      loginWithSms: 'Login with SMS',
      loginWithPassword: 'Login with Password',
      sendCode: 'Send Verification Code',
      resendCode: 'Resend Code',
      verifyCode: 'Verify & Login',
      verifyAndRegister: 'Verify & Create Account',
      otpSent: 'Verification code sent to your number',
      otpPlaceholder: '5-digit code',
      otpExpires: 'Code expires in',
      seconds: 'seconds',
      back: 'Back',
      sending: 'Sending...',
      verifying: 'Verifying...',
    },

    legal: {
      footerLinks: [
        { href: '#/about', label: 'About Us' },
        { href: '#/contact', label: 'Contact Us' },
        { href: '#/terms', label: 'Terms & Conditions' },
        { href: '#/privacy', label: 'Privacy Policy' },
        { href: '#/refund', label: 'Refund Policy' },
        { href: '#/faq', label: 'FAQ' },
      ],
      lastUpdated: '2025/05/22',

      about: {
        meta: 'Learn about IRIS online clothing store — an Iranian brand specializing in Y2K fashion and unique long sleeves with nationwide shipping.',
        title: 'About Us',
        subtitle: 'The story of IRIS; where contemporary fashion meets Iranian identity.',
        icon: 'sparkles',
        intro: 'IRIS was established in 2023 with the goal of offering unique, high-quality clothing to Iran\'s young generation. We provide a collection of Y2K apparel, designed long sleeves, and distinctive streetwear with a focus on details, precise stitching, and quality fabrics. Every product is carefully selected and quality-controlled to ensure a reliable and enjoyable online shopping experience for you.',
        sectionTitles: {
          intro: 'Introduction to IRIS',
          mission: 'Our Mission',
          vision: 'Our Vision',
          whyChooseUs: 'Why IRIS?',
          stats: 'IRIS at a Glance',
          team: 'Our Team',
        },
        mission: 'Providing modern, high-quality clothing at fair prices, maintaining high production standards, and building honest relationships with customers across Iran.',
        vision: 'To become Iran\'s leading online destination for streetwear and Y2K fashion, recognized as a brand that prioritizes quality, authenticity, and customer satisfaction.',
        whyChooseUs: [
          { icon: 'shield-check', title: 'Secure Shopping', desc: 'Secure payment and responsive support throughout the order process.' },
          { icon: 'truck', title: 'Fast Shipping', desc: 'Nationwide delivery with secure packaging and online tracking.' },
          { icon: 'refresh-ccw', title: 'Easy Returns', desc: 'Return products within 7 days of delivery, subject to terms.' },
          { icon: 'gem', title: 'Superior Quality', desc: 'Premium fabric selection and quality control before shipping.' },
        ],
        stats: [
          { value: '5,000+', label: 'Happy Customers' },
          { value: '200+', label: 'Active Products' },
          { value: '31', label: 'Provinces Covered' },
          { value: '98%', label: 'Customer Satisfaction' },
        ],
        team: [
          { name: 'Sara Mohammadi', role: 'CEO & Founder', avatar: '' },
          { name: 'Amir Hosseini', role: 'Design & Production Director', avatar: '' },
          { name: 'Niloofar Karimi', role: 'Customer Support Manager', avatar: '' },
          { name: 'Reza Ahmadi', role: 'Technical & Online Store Manager', avatar: '' },
        ],
      },

      contact: {
        meta: 'Ways to reach IRIS store — phone, email, address, hours, and contact form for support and inquiries.',
        title: 'Contact Us',
        subtitle: 'The IRIS support team is ready to answer your questions about products, orders, and partnerships.',
        icon: 'message-circle',
        formSectionTitle: 'Contact Information',
        formUnavailable: 'The contact form will be active soon. Please use the contact details above.',
        phone: { label: 'Phone', value: '+98-21-91001234', note: 'Sat–Thu, 9 AM – 6 PM' },
        email: { label: 'Email', value: 'support@iris-fashion.ir', note: 'Response within 24 hours' },
        address: { label: 'Address', value: 'Tehran, Valiasr St., above Saei Park, No. 1234, Unit 5', note: 'By appointment only' },
        hours: { label: 'Business Hours', value: 'Sat–Thu: 9:00 AM – 6:00 PM', note: 'Closed on Fridays and public holidays' },
        mapPlaceholder: 'Store Location Map',
        form: {
          nameLabel: 'Full Name',
          namePlaceholder: 'e.g. Ali Rezaei',
          emailLabel: 'Email',
          emailPlaceholder: 'example@email.com',
          phoneLabel: 'Mobile Number',
          phonePlaceholder: '09123456789',
          subjectLabel: 'Subject',
          subjectPlaceholder: 'Select a subject',
          subjects: ['Order Tracking', 'Product Inquiry', 'Returns & Refunds', 'Wholesale & Collaboration', 'Other'],
          messageLabel: 'Your Message',
          messagePlaceholder: 'Write your message...',
          submit: 'Send Message',
          success: 'Your message has been sent successfully. We will contact you soon.',
        },
      },

      terms: {
        meta: 'Terms and conditions for using the IRIS online store — order, payment, obligations, and intellectual property rights.',
        title: 'Terms & Conditions',
        subtitle: 'Please read the following terms carefully before placing an order.',
        icon: 'scale',
        sections: [
          {
            title: 'Definitions and Acceptance of Terms',
            content: [
              '"Store" refers to the IRIS website and all related online services. "User" means any person who uses the store\'s services.',
              'Registration, login, or placing an order constitutes full acceptance of these terms and conditions.',
            ],
          },
          {
            title: 'User Obligations',
            items: [
              'Providing accurate and complete information during registration and order placement.',
              'Maintaining account security and not disclosing your password to others.',
              'Using the store solely for lawful and personal purposes.',
              'Not misusing discount codes, payment systems, or the order process.',
              'Complying with the laws of the Islamic Republic of Iran in all interactions.',
            ],
          },
          {
            title: 'Store Obligations',
            items: [
              'Displaying accurate product specifications, images, and prices to the best of our ability.',
              'Shipping orders within the stated timeframe after payment confirmation.',
              'Protecting users\' personal information in accordance with the privacy policy.',
              'Responding to customer inquiries and complaints as soon as possible.',
              'Complying with e-commerce regulations and consumer protection laws.',
            ],
          },
          {
            title: 'Ordering Policies',
            items: [
              'An order is finalized after registration and payment confirmation and cannot be canceled except under the return policy.',
              'Product inventory is limited; if stock runs out, the order will be canceled and the amount refunded.',
              'Size and color selection is the customer\'s responsibility; please refer to the size guide.',
              'The store reserves the right to cancel orders in case of pricing or information errors.',
            ],
          },
          {
            title: 'Payment Policies',
            content: [
              'Payment is made via card-to-card transfer or authorized bank gateways. The order amount must be deposited within 24 hours of order placement.',
            ],
            items: [
              'The accuracy of payment information is the customer\'s responsibility.',
              'If payment is not made on time, the order will be automatically canceled.',
              'The payment receipt must be legible and match the order amount.',
              'Shipping costs are calculated according to the terms stated on the cart page.',
            ],
          },
          {
            title: 'Intellectual Property',
            content: [
              'All website content, including logo, images, designs, texts, and the IRIS brand name, is protected by intellectual property laws.',
            ],
            items: [
              'Copying, republishing, or commercial use without written permission is prohibited.',
              'IRIS\'s exclusive designs belong to the brand.',
              'Users may not download or save content for unauthorized use.',
            ],
          },
        ],
      },

      privacy: {
        meta: 'IRIS privacy policy — how we collect, use, store, and protect users\' personal information.',
        title: 'Privacy Policy',
        subtitle: 'Protecting your information is our priority. This page explains how we handle your personal data.',
        icon: 'lock',
        sections: [
          {
            title: 'Data Collection Policy',
            content: [
              'We collect information that you voluntarily provide to us. This information is essential for providing store services.',
            ],
            items: [
              'Identity information: name, mobile number, email.',
              'Order information: address, postal code, province, city.',
              'Payment information: transaction number and receipt image (bank card details are not stored).',
              'Technical information: IP address, browser type, and device for security improvement.',
            ],
          },
          {
            title: 'Data Usage Policy',
            items: [
              'Processing and shipping registered orders.',
              'Communicating with customers about order status and support.',
              'Improving user experience and website performance.',
              'Sending relevant notifications (if subscribed to the newsletter).',
              'Preventing fraud and misuse of services.',
            ],
          },
          {
            title: 'Cookie Policy',
            content: [
              'The IRIS website uses cookies and similar technologies to improve performance and maintain your login status.',
            ],
            items: [
              'Essential cookies: for proper cart and login functionality.',
              'Analytical cookies: to understand user behavior and improve services (anonymous).',
              'You can disable cookies in your browser settings; some features may be limited.',
            ],
          },
          {
            title: 'Information Security Policy',
            content: [
              'We use appropriate technical and organizational measures to protect your information.',
            ],
            items: [
              'Encrypted communication (HTTPS/SSL) on all pages.',
              'Limited employee access to personal information.',
              'Secure storage of data on servers within Iran.',
              'No sale or transfer of personal information to third parties without your consent.',
              'In case of a security breach, users will be notified in accordance with regulations.',
            ],
          },
        ],
      },

      refund: {
        meta: 'Refund and order cancellation terms at IRIS store — return, exchange, and damaged goods policies.',
        title: 'Refund and Order Cancellation Terms',
        subtitle: 'We take your satisfaction seriously. This page explains returns, exchanges, and refund procedures.',
        icon: 'rotate-ccw',
        sections: [
          {
            title: 'Return Conditions',
            items: [
              'Return requests accepted within 7 business days of delivery.',
              'Product must be unused, unwashed, with no stains and original tags attached.',
              'Original packaging must be intact and complete.',
              'Hygienic undergarments and custom-made products are not returnable.',
              'Return shipping costs are the buyer\'s responsibility in case of a change of mind.',
            ],
          },
          {
            title: 'Refund Process',
            content: [
              'After receiving and inspecting the returned item, the amount will be transferred to your bank account within 3 to 7 business days.',
            ],
            items: [
              'Submit a return request by contacting support or via the contact form.',
              'Receive a return code and the return shipping address.',
              'Send the product with proper packaging.',
              'Quality inspection by the IRIS team.',
              'Transfer of funds to the IBAN or card number registered in the order.',
            ],
          },
          {
            title: 'Exchange Policy',
            items: [
              'Exchange for a different size or color is possible within 7 days of delivery (subject to availability).',
              'Any price differences between sizes or models are payable by the customer.',
              'Replacement item is shipped after the original product is received.',
              'If the requested item is unavailable, a refund will be issued.',
            ],
          },
          {
            title: 'Damaged or Defective Goods Policy',
            content: [
              'If you receive a damaged or defective product, notify support within 48 hours.',
            ],
            items: [
              'Send a clear image of the damage via WhatsApp or email.',
              'Reshipping or refund costs are borne by the store.',
              'If a manufacturing defect is confirmed, a free exchange or full refund will be issued.',
              'Damage caused by improper use is not covered by this policy.',
            ],
          },
        ],
      },

      faq: {
        meta: 'Answers to frequently asked questions about shopping, shipping, payment, sizing, and returns at IRIS online clothing store.',
        title: 'Frequently Asked Questions',
        subtitle: 'Answers to the most common questions about shopping, shipping, and support.',
        icon: 'help-circle',
        items: [
          { question: 'How do I place an order?', answer: 'Select your desired product, choose size and quantity, and add to cart. Then enter shipping information and complete payment.' },
          { question: 'What are the payment methods?', answer: 'Payment is made via card-to-card transfer to the account number shown on the payment page. After transfer, upload the receipt image.' },
          { question: 'How much is shipping?', answer: 'Standard shipping is 50,000 Toman. Orders over 1,500,000 Toman qualify for free shipping.' },
          { question: 'How long does delivery take?', answer: 'Orders in Tehran take 1–3 business days, and other cities take 3–7 business days after payment confirmation.' },
          { question: 'Is cash on delivery available?', answer: 'Cash on delivery is currently not available. All orders must be paid in full before shipping.' },
          { question: 'How do I choose the right size?', answer: 'A size guide is available on each product page. If in doubt, contact support for expert guidance.' },
          { question: 'Can I cancel my order?', answer: 'Cancellation is possible before the product is shipped. After shipping, you may only request a return under the return policy.' },
          { question: 'What are the return conditions?', answer: 'Returns are accepted within 7 days of delivery for unused products with original tags. Details are in the "Refund Policy" page.' },
          { question: 'What if I receive a defective product?', answer: 'Send a photo of the defect to support within 48 hours. A free exchange or refund will be arranged.' },
          { question: 'How do I track my order?', answer: 'After logging in, go to "Orders" to see real-time status. SMS notifications are also sent.' },
          { question: 'Do you offer discount codes?', answer: 'Yes. Seasonal and promotional discount codes are announced via our newsletter and social media.' },
          { question: 'Are the products authentic?', answer: 'All IRIS products are exclusive productions or sourced from reputable suppliers, and undergo quality control before shipping.' },
          { question: 'Do you ship to smaller cities?', answer: 'Yes. We ship to all provinces in Iran via Post and TIPAX.' },
          { question: 'What are support hours?', answer: 'Sat–Thu, 9 AM – 6 PM. Emails are responded to within 24 hours.' },
          { question: 'Is bulk purchasing available?', answer: 'Yes. For wholesale inquiries, submit your request via the contact form or email with the subject "Collaboration".' },
          { question: 'How do I create an account?', answer: 'On the login page, select "Create Account". Registration is done via mobile number and password.' },
        ],
      },
    },

    newsletter: {
      title: '',
      subtitle: 'Subscribe to receive updates on new collections.',
      button: 'Subscribe',
      placeholder: 'Your email...',
    },

    admin: {
      title: 'Admin Panel',
      panelLabel: 'Admin Panel',
      logout: 'Logout',
      lightMode: 'Light Mode',
      loading: 'Loading...',

      nav: {
        dashboard: 'Dashboard',
        products: 'Products',
        categories: 'Categories',
        orders: 'Orders',
        users: 'Users',
        discounts: 'Discount Codes',
        settings: 'Settings',
        pages: 'Page Content',
      },

      dashboard: {
        title: 'Dashboard',
        subtitle: 'Store performance overview',
        refresh: 'Refresh',
        stats: {
          products: 'Products',
          ordersToday: 'Today\'s Orders',
          lowStock: 'Low Stock',
          pending: 'Pending Review',
          totalOrders: 'Total Orders',
          totalRevenue: 'Total Revenue',
          totalUsers: 'Users',
        },
        weeklyRevenue: 'Revenue (Last 7 Days)',
        orderStatus: 'Order Status Distribution',
        financialSummary: 'Financial Summary',
        noSales: 'No sales recorded yet',
        noData: 'No data available',
        ordersLabel: 'Orders',
      },

      products: {
        title: 'Products',
        subtitle: 'Manage store products',
        add: 'Add Product',
        searchPlaceholder: 'Search products...',
        allCategories: 'All Categories',
        selectCategory: 'Select Category',
        sortNewest: 'Newest',
        sortPriceAsc: 'Price: Low to High',
        sortPriceDesc: 'Price: High to Low',
        search: 'Search',
        empty: 'No products found',
        modalAdd: 'Add Product',
        modalEdit: 'Edit Product',
        save: 'Save Product',
        update: 'Update',
        featured: 'Featured Product',
        featuredBadge: 'Featured',
        normalBadge: 'Normal',
        mainImage: 'Main',
        addImage: 'Add Image',
        slug: 'Slug',
        status: 'Status',
        statusDraft: 'Draft',
        statusActive: 'Active',
        statusArchived: 'Archived',
        shortDesc: 'Short Description',
        fullDesc: 'Full Description',
        category: 'Category',
        productType: 'Product Type',
        typeSimple: 'Simple',
        typeVariable: 'Variable',
        price: 'Price',
        stock: 'Stock',
        generateVariants: 'Generate Variants',
        variantsHint: 'Select variant axes and generate.',
        variantTitle: 'Title',
        emptyVariants: 'No variants',
        tabGeneral: 'General',
        tabVariants: 'Variants',
        tabMedia: 'Images',
        variantSetupIncomplete: 'This is a variable product but size/color variants have not been generated. Select axes and click "Generate Variants", then set stock for each variant.',
        variantSetupRequired: 'To publish this variable product, first generate size/color variants.',
      },

      categories: {
        title: 'Categories',
        subtitle: 'Manage product categories',
        add: 'Add Category',
        empty: 'No categories found',
        modalAdd: 'Add Category',
        modalEdit: 'Edit Category',
        save: 'Save',
        update: 'Update',
        selectImage: 'Select Image',
      },

      orders: {
        title: 'Orders',
        subtitle: 'Manage orders',
        searchPlaceholder: 'Search orders...',
        allStatuses: 'All Statuses',
        filter: 'Filter',
        empty: 'No orders found',
        viewReceipt: 'View Receipt',
        approve: 'Approve',
        reject: 'Reject',
      },

      users: {
        title: 'Users',
        subtitle: 'Manage users',
        empty: 'No users found',
        roleAdmin: 'Admin',
        roleUser: 'User',
        demote: 'Remove Admin',
      },

      discounts: {
        title: 'Discount Codes',
        subtitle: 'Manage discount codes',
        add: 'New Discount Code',
        empty: 'No discount codes found',
        loading: 'Loading...',
        modalTitle: 'New Discount Code',
        create: 'Create Discount Code',
        active: 'Active',
        expired: 'Expired',
        inactive: 'Inactive',
        deactivate: 'Deactivate',
        delete: 'Delete',
        noExpiry: 'No expiry date',
        percentOff: '% Off',
        fixedOff: 'Toman Off',
      },

      settings: {
        title: 'Settings',
        subtitle: 'Store Settings',
        tabs: {
          identity: 'Store Identity',
          payment: 'Payment',
          contact: 'Contact & Social',
          shipping: 'Shipping & Orders',
          sms: 'SMS',
          trust: 'Trust Badge',
          seo: 'SEO',
        },

        identity: {
          shopName: 'Store Name',
          shopSlogan: 'Store Slogan',
          shopDescription: 'Store Description',
          logo: 'Logo',
          heroImage: 'Hero Image (Homepage)',
          heroSlider: 'Hero Slider Images',
          heroSliderHint: 'Maximum 3 images. Drag to reorder.',
          heroSliderCount: 'Image Count',
          heroSliderAlt: 'Alt Text',
          heroSliderAdd: 'Add Image',
          heroSliderReplace: 'Replace',
          heroSliderRemove: 'Remove',
          heroSliderEmpty: 'No images have been uploaded for the hero slider yet.',
          heroSliderMaxReached: 'Maximum 3 images allowed.',
          poster: 'Feature Section Poster',
          favicon: 'Favicon',
          upload: 'Upload Image',
          change: 'Change Image',
        },

        payment: {
          method: 'Payment Method',
          cardToCard: 'Card to Card',
          zarinpal: 'Zarinpal',
          both: 'Both',
          bankCard: 'Bank Card Number',
          bankOwner: 'Cardholder Name',
          merchantId: 'Zarinpal Merchant ID',
        },

        contact: {
          phone: 'Phone Number',
          email: 'Email',
          address: 'Address',
          instagram: 'Instagram',
          telegram: 'Telegram',
          whatsapp: 'WhatsApp',
        },

        trust: {
          enamadHtml: 'Trust Badge HTML Code (Enamad)',
          enamadHint: 'Paste the HTML code from your enamad.ir panel here. After saving, the trust badge will appear in the site footer.',
          preview: 'Footer Preview',
          invalidEmbed: 'Invalid HTML code. Please paste the code received from enamad.ir.',
        },

        shipping: {
          standardCost: 'Shipping Cost (Toman)',
          freeFrom: 'Free Shipping From (Toman)',
          minOrder: 'Minimum Order Amount (Toman)',
        },

        sms: {
          enabled: 'Enable SMS',
          provider: 'Provider',
          apiKey: 'API Key',
        },

        seo: {
          metaTitle: 'SEO Title',
          metaDescription: 'SEO Description',
        },

        save: 'Save Settings',
        saving: 'Saving...',
        saved: 'Settings Saved',
        loading: 'Loading...',
        uploadSuccess: 'Image uploaded successfully',
      },

      pages: {
        title: 'Page Content',
        subtitle: 'Edit content for About Us, Contact, Terms, etc.',
        save: 'Save Content',
        saving: 'Saving...',
        saved: 'Content Saved',
        preview: 'View on Site',
        lastUpdated: 'Last Updated',

        tabs: {
          about: 'About Us',
          contact: 'Contact Us',
          terms: 'Terms & Conditions',
          privacy: 'Privacy Policy',
          refund: 'Refund Policy',
          faq: 'FAQ',
        },

        fields: {
          title: 'Page Title',
          subtitle: 'Subtitle',
          meta: 'SEO Description',
          intro: 'Introduction Text',
          mission: 'Mission',
          vision: 'Vision',
          formSectionTitle: 'Form Section Title',
          formUnavailable: 'Form Fallback Text',
          mapPlaceholder: 'Map Fallback Text',
          label: 'Label',
          value: 'Value',
          note: 'Short Note',
          sectionTitle: 'Section Title',
          paragraphs: 'Paragraphs (one per line)',
          bullets: 'List Items (one per line)',
          question: 'Question',
          answer: 'Answer',
          icon: 'Icon (lucide)',
          desc: 'Description',
          role: 'Role',
          name: 'Name',
        },

        addSection: 'Add Section',
        addFaq: 'Add Question',
        addWhy: 'Add Item',
        addStat: 'Add Statistic',
        addTeam: 'Add Team Member',
        remove: 'Remove',

        sectionTitles: {
          intro: 'Introduction Section Title',
          mission: 'Mission Section Title',
          vision: 'Vision Section Title',
          whyChooseUs: 'Why Choose Us Section Title',
          stats: 'Statistics Section Title',
          team: 'Team Section Title',
        },
      },

      orderStatuses: {
        pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
        paid: { label: 'Paid', cls: 'bg-blue-100 text-blue-800' },
        shipped: { label: 'Shipped', cls: 'bg-purple-100 text-purple-800' },
        delivered: { label: 'Delivered', cls: 'bg-green-100 text-green-800' },
        cancelled: { label: 'Cancelled', cls: 'bg-card text-muted' },
      },

      common: {
        cancel: 'Cancel',
        save: 'Save',
        search: 'Search',
        filter: 'Filter',
        edit: 'Edit',
        delete: 'Delete',
        nameRequired: 'Name is required',
        codeValueRequired: 'Code and value are required',
      },
    },
  },

  api: {
    baseUrl: 'api/v1',
  },
};