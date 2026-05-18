import type { Step } from 'react-joyride'

const d = (tourLabel: string) => ({ tourLabel })

export const TOUR_STEPS: Record<string, Step[]> = {
    dashboard: [
        {
            target: '[data-tour="dashboard-stats"]',
            title: 'Your business at a glance',
            content: 'These cards show your most important metrics — revenue, upcoming appointments, and client activity — updated in real time.',
            placement: 'bottom',
            data: d('DASHBOARD TOUR'),
            skipBeacon: false,
        },
        {
            target: '[data-tour="dashboard-week-strip"]',
            title: 'Your week ahead',
            content: 'See how many appointments you have each day this week. Click any day to jump straight to that day\'s schedule.',
            placement: 'bottom',
            data: d('DASHBOARD TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="dashboard-today"]',
            title: 'Today\'s schedule',
            content: 'Your appointments for today are listed here. Tap any appointment card to view details, confirm, or reschedule.',
            placement: 'top',
            data: d('DASHBOARD TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="dashboard-booking-link"]',
            title: 'Your booking link',
            content: 'Share this link with clients so they can book directly with you. Copy it or share it to social media in one tap.',
            placement: 'top',
            data: d('DASHBOARD TOUR'),
            skipBeacon: true,
        },
    ],

    appointments: [
        {
            target: '[data-tour="appointments-view-switcher"]',
            title: 'Switch your view',
            content: 'Toggle between list and calendar views to see your appointments the way that works best for you.',
            placement: 'bottom',
            data: d('APPOINTMENTS TOUR'),
            skipBeacon: false,
        },
        {
            target: '[data-tour="appointments-list"]',
            title: 'Your appointments',
            content: 'Every appointment appears here. Use the filters at the top to find confirmed, pending, or completed appointments quickly.',
            placement: 'top',
            data: d('APPOINTMENTS TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="appointments-view-switcher"]',
            title: 'Client view',
            content: 'Switch to Clients view to group all appointments by person — great for seeing a client\'s full history at a glance.',
            placement: 'bottom',
            data: d('APPOINTMENTS TOUR'),
            skipBeacon: true,
        },
    ],

    services: [
        {
            target: '[data-tour="services-add"]',
            title: 'Add your first service',
            content: 'Create the services you offer — set a name, description, duration, and price. Clients will see these when booking.',
            placement: 'bottom',
            data: d('SERVICES TOUR'),
            skipBeacon: false,
        },
        {
            target: '[data-tour="services-list"]',
            title: 'Your service menu',
            content: 'All your services are listed here. Tap any card to edit pricing, duration, and which days it\'s available.',
            placement: 'top',
            data: d('SERVICES TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="services-header"]',
            title: 'Customize inside each service',
            content: 'Open any service to set its own availability schedule, attach add-ons, and upload a photo — all from one place.',
            placement: 'bottom',
            data: d('SERVICES TOUR'),
            skipBeacon: true,
        },
    ],

    addons: [
        {
            target: '[data-tour="addons-create"]',
            title: 'Service add-ons',
            content: 'Add-ons let clients upgrade their appointment — extra treatments, products, or extended time. Open this menu to create your first one.',
            placement: 'bottom',
            data: d('ADD-ONS TOUR'),
            skipBeacon: false,
        },
        {
            target: '[data-tour="addons-create"]',
            title: 'Edit or delete add-ons',
            content: 'Your add-ons are listed in this dropdown. Click any one to edit its name, price, or remove it without affecting past bookings.',
            placement: 'bottom',
            data: d('ADD-ONS TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="services-list"]',
            title: 'Attach add-ons to services',
            content: 'Open any service card and scroll to the Add-ons section to link them. Add-ons only appear during booking for services they\'re attached to.',
            placement: 'top',
            data: d('ADD-ONS TOUR'),
            skipBeacon: true,
        },
    ],

    availability: [
        {
            target: '[data-tour="availability-default"]',
            title: 'Your availability schedule',
            content: 'This is where you control when clients can book. Each card defines a set of working hours — tap one to edit days, times, and date ranges.',
            placement: 'bottom',
            data: d('AVAILABILITY TOUR'),
            skipBeacon: false,
        },
        {
            target: '[data-tour="availability-list"]',
            title: 'Your schedules',
            content: 'Each card represents an availability window. The default schedule applies to all services unless a service overrides it.',
            placement: 'top',
            data: d('AVAILABILITY TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="availability-multiple"]',
            title: 'Multiple schedules',
            content: 'Running a seasonal schedule or taking a break? Create a separate availability window — useful for holidays or special hours. Growth plan only.',
            placement: 'bottom',
            data: d('AVAILABILITY TOUR'),
            skipBeacon: true,
        },
    ],

    bookingSettings: [
        {
            target: '[data-tour="settings-deposit"]',
            title: 'Require a deposit',
            content: 'Protect your time by requiring clients to pay a deposit when booking. Set it as a flat fee or a percentage.',
            placement: 'bottom',
            data: d('BOOKING SETTINGS TOUR'),
            skipBeacon: false,
        },
        {
            target: '[data-tour="settings-cancellation"]',
            title: 'Cancellation policy',
            content: 'Define how many days before an appointment a client can cancel. Inside that window, the deposit is forfeited.',
            placement: 'top',
            data: d('BOOKING SETTINGS TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="settings-reschedule"]',
            title: 'Reschedule policy',
            content: 'Set the minimum notice required for a reschedule and how many times a client can reschedule for free.',
            placement: 'top',
            data: d('BOOKING SETTINGS TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="settings-booking-window"]',
            title: 'Booking window',
            content: 'Control how far in advance clients can book and the minimum notice you need before an appointment.',
            placement: 'top',
            data: d('BOOKING SETTINGS TOUR'),
            skipBeacon: true,
        },
    ],

    analytics: [
        {
            target: '[data-tour="analytics-revenue"]',
            title: 'Revenue overview',
            content: 'See your total revenue this month, last month, and over the year — with a trend line to spot growth patterns.',
            placement: 'bottom',
            data: d('ANALYTICS TOUR'),
            skipBeacon: false,
        },
        {
            target: '[data-tour="analytics-services"]',
            title: 'Top-performing services',
            content: 'Discover which services drive the most revenue and bookings. Use this to decide what to promote or expand.',
            placement: 'top',
            data: d('ANALYTICS TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="analytics-clients"]',
            title: 'Client retention',
            content: 'Track how many clients return versus one-time visitors. A high retention rate means clients love your work.',
            placement: 'top',
            data: d('ANALYTICS TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="analytics-due"]',
            title: 'Clients due for a visit',
            content: 'These clients haven\'t been in a while based on their usual booking frequency. A perfect list for outreach.',
            placement: 'top',
            data: d('ANALYTICS TOUR'),
            skipBeacon: true,
        },
    ],

    monetization: [
        {
            target: '[data-tour="monetization-stripe"]',
            title: 'Connect Stripe',
            content: 'Link your Stripe account to receive payments directly. Setup takes about 2 minutes and payouts go straight to your bank.',
            placement: 'bottom',
            data: d('MONETIZATION TOUR'),
            skipBeacon: false,
        },
        {
            target: '[data-tour="monetization-payment-methods"]',
            title: 'Payment methods',
            content: 'Clients can pay by card online. You can also record cash payments manually through each appointment.',
            placement: 'top',
            data: d('MONETIZATION TOUR'),
            skipBeacon: true,
        },
        {
            target: '[data-tour="monetization-deposits"]',
            title: 'Deposit tracking',
            content: 'Every deposit collected is tracked here. See what\'s been paid, what\'s outstanding, and your total collected.',
            placement: 'top',
            data: d('MONETIZATION TOUR'),
            skipBeacon: true,
        },
    ],

    // Steps shown when the user hasn't published a site yet (SelectEditorType page)
    webBuilder: [
        {
            target: '[data-tour="builder-type"]',
            title: 'Choose your builder',
            content: 'Start with a blank canvas for full control, or pick a template to get a polished page up in minutes.',
            placement: 'bottom',
            data: d('WEB BUILDER TOUR'),
            skipBeacon: false,
        },
        {
            target: '[data-tour="builder-templates"]',
            title: 'Two editor styles',
            content: 'Drag & Drop gives you full visual control; Section Editor gets you live in minutes. Both are fully editable — you can switch later.',
            placement: 'bottom',
            data: d('WEB BUILDER TOUR'),
            skipBeacon: true,
        },
    ],

    // Steps shown once a site is published (ManageBookingSite page)
    webBuilderManage: [
        {
            target: '[data-tour="builder-publish"]',
            title: 'Your live booking site',
            content: 'Your site is live at your AfroAllure URL. Click "Edit Page" to open the editor, update your appearance, or copy your link to share with clients.',
            placement: 'bottom',
            data: d('BOOKING SITE TOUR'),
            skipBeacon: false,
        },
    ],
}

export const TOUR_DISPLAY_NAMES: Record<string, string> = {
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    services: 'Services',
    addons: 'Add-Ons',
    availability: 'Availability',
    bookingSettings: 'Booking Settings',
    analytics: 'Analytics',
    monetization: 'Monetization',
    webBuilder: 'Web Builder Setup',
    webBuilderManage: 'Booking Site',
}

export const TOUR_DESCRIPTIONS: Record<string, string> = {
    dashboard: 'Stats, today\'s schedule, and your booking link',
    appointments: 'Managing, filtering, and viewing your bookings',
    services: 'Creating and editing your service menu',
    addons: 'Upselling clients with optional extras',
    availability: 'Setting your hours and scheduling windows',
    bookingSettings: 'Deposits, cancellation, and reschedule policies',
    analytics: 'Revenue, retention, and performance insights',
    monetization: 'Stripe setup and payment tracking',
    webBuilder: 'Choosing your editor style when setting up',
    webBuilderManage: 'Managing your live site, appearance, and URL',
}

export const TOUR_ROUTES: Record<string, string> = {
    dashboard: '/dashboard',
    appointments: '/dashboard/appointments',
    services: '/dashboard/services',
    addons: '/dashboard/services',
    availability: '/dashboard/availability',
    bookingSettings: '/dashboard/booking-settings',
    analytics: '/dashboard/analytics',
    monetization: '/dashboard/monetization',
    webBuilder: '/dashboard/booking-site',
    webBuilderManage: '/dashboard/booking-site',
}
