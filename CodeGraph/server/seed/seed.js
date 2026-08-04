const { getSession, closeDriver } = require('../config/db');
require('dotenv').config();

const nodes = [

  { label: 'FrontendPage', name: 'Login Page', desc: 'Authentication screen with username and password inputs.' },
  { label: 'FrontendPage', name: 'Dashboard Page', desc: 'Control center showing system overviews and fast shortcuts.', },
  { label: 'FrontendPage', name: 'Products Page', desc: 'Browse catalog, list filter options, and choose inventory.', },
  { label: 'FrontendPage', name: 'Cart Page', desc: 'Item summaries, quantity controls, and total price tallies.', },
  { label: 'FrontendPage', name: 'Checkout Page', desc: 'Form to enter card credentials, billing, and complete purchase.', },
  { label: 'FrontendPage', name: 'Orders Page', desc: 'Lists successful order confirmations, shipping logs, and receipts.', },
  { label: 'FrontendPage', name: 'Profile Page', desc: 'Lets users update email address, profile pics, and billing address.', },
  { label: 'FrontendPage', name: 'Admin Panel', desc: 'Internal console for site operators to manage inventories.', },
  { label: 'FrontendPage', name: 'Support Portal', desc: 'Interactive live chat widget for user tickets and queries.', },
  { label: 'FrontendPage', name: 'Settings Page', desc: 'Configuration sliders for notifications and session preferences.', },


  { label: 'API', name: 'Login API', desc: 'Validates credential payloads and signs secure JWT sessions.' },
  { label: 'API', name: 'Register API', desc: 'Registers new customer accounts and initializes default scopes.' },
  { label: 'API', name: 'Products API', desc: 'Fetches products list, paginates search queries, and details items.' },
  { label: 'API', name: 'Cart API', desc: 'Manages user baskets, persistent items, and discount coupons.' },
  { label: 'API', name: 'Checkout API', desc: 'Initiates cart validation, reservation locks, and starts invoice billing.', },
  { label: 'API', name: 'Payment API', desc: 'Validates raw credit card digits and securely triggers payment gateways.', },
  { label: 'API', name: 'Orders API', desc: 'Creates order receipts, coordinates invoice creation, and logs state.', },
  { label: 'API', name: 'Profile API', desc: 'Exposes profile data endpoints and sanitizes user details uploads.', },
  { label: 'API', name: 'Admin API', desc: 'Controls backend feature flags, triggers stock syncs, and overrides orders.', },
  { label: 'API', name: 'Support API', desc: 'Routes support tickets to ZenDesk API and queries historical resolutions.', },
  { label: 'API', name: 'Notification API', desc: 'Sends push, SMS, and HTML-formatted emails to users.', },
  { label: 'API', name: 'Shipping API', desc: 'Calculates courier costs, registers air bills, and tracks delivery status.', },


  { label: 'Service', name: 'Authentication Service', desc: 'Authenticates tokens, hashes credentials, and rotates secret keys.' },
  { label: 'Service', name: 'User Service', desc: 'Coordinates DB records for profile edits and permission roles.' },
  { label: 'Service', name: 'Product Service', desc: 'Resolves warehouse quantities and queries elastic indices.' },
  { label: 'Service', name: 'Order Service', desc: 'Applies finite state machine transitions for order logs.' },
  { label: 'Service', name: 'Payment Service', desc: 'Encrypts payloads and records billing audit ledgers.' },
  { label: 'Service', name: 'Notification Service', desc: 'Subscribes to notifications topic and formats mail templates.' },
  { label: 'Service', name: 'Inventory Service', desc: 'Locks items temporarily in warehouses during checks.' },
  { label: 'Service', name: 'Shipping Service', desc: 'Contacts logistic carriers and books freight labels.' },


  { label: 'Database', name: 'System DB', desc: 'Main consolidated application database storing all product, order, payment, and user accounts data.' },


  { label: 'DeveloperTeam', name: 'Platform Team', desc: 'Engineering team focused on cloud infrastructure and database pools.' },
  { label: 'DeveloperTeam', name: 'Authentication Team', desc: 'Secures authentication gateways, API scopes, and login modules.' },
  { label: 'DeveloperTeam', name: 'Commerce Team', desc: 'Builds shopping experiences, search filters, and checkout routes.' },
  { label: 'DeveloperTeam', name: 'Payments Team', desc: 'Manages ledger compliance, refunds, and bank integrations.' },
  { label: 'DeveloperTeam', name: 'Support Team', desc: 'Maintains live chat tools, client feedback hubs, and help desks.' },
  { label: 'DeveloperTeam', name: 'Logistics Team', desc: 'Coordinates package routes, carrier systems, and tracking adapters.' },


  { label: 'ExternalService', name: 'Stripe', desc: 'Card verification system and online banking API processor.' },
  { label: 'ExternalService', name: 'Razorpay', desc: 'APAC localization financial processor for card transactions.' },
  { label: 'ExternalService', name: 'AWS S3', desc: 'Secure cloud object storage storing image uploads and invoice PDFs.' },
  { label: 'ExternalService', name: 'SendGrid', desc: 'Cloud transactional email service provider.' },
  { label: 'ExternalService', name: 'FedEx API', desc: 'Shipping logistics API calculating shipping weights.' }
];

const relationships = [

  { fromLabel: 'FrontendPage', fromName: 'Login Page', rel: 'CALLS', toLabel: 'API', toName: 'Login API' },
  { fromLabel: 'FrontendPage', fromName: 'Login Page', rel: 'CALLS', toLabel: 'API', toName: 'Register API' },
  { fromLabel: 'FrontendPage', fromName: 'Dashboard Page', rel: 'CALLS', toLabel: 'API', toName: 'Profile API' },
  { fromLabel: 'FrontendPage', fromName: 'Dashboard Page', rel: 'CALLS', toLabel: 'API', toName: 'Orders API' },
  { fromLabel: 'FrontendPage', fromName: 'Dashboard Page', rel: 'CALLS', toLabel: 'API', toName: 'Products API' },
  { fromLabel: 'FrontendPage', fromName: 'Dashboard Page', rel: 'CALLS', toLabel: 'API', toName: 'Notification API' },
  { fromLabel: 'FrontendPage', fromName: 'Products Page', rel: 'CALLS', toLabel: 'API', toName: 'Products API' },
  { fromLabel: 'FrontendPage', fromName: 'Products Page', rel: 'CALLS', toLabel: 'API', toName: 'Cart API' },
  { fromLabel: 'FrontendPage', fromName: 'Cart Page', rel: 'CALLS', toLabel: 'API', toName: 'Cart API' },
  { fromLabel: 'FrontendPage', fromName: 'Cart Page', rel: 'CALLS', toLabel: 'API', toName: 'Checkout API' },
  { fromLabel: 'FrontendPage', fromName: 'Checkout Page', rel: 'CALLS', toLabel: 'API', toName: 'Checkout API' },
  { fromLabel: 'FrontendPage', fromName: 'Checkout Page', rel: 'CALLS', toLabel: 'API', toName: 'Payment API' },
  { fromLabel: 'FrontendPage', fromName: 'Orders Page', rel: 'CALLS', toLabel: 'API', toName: 'Orders API' },
  { fromLabel: 'FrontendPage', fromName: 'Profile Page', rel: 'CALLS', toLabel: 'API', toName: 'Profile API' },
  { fromLabel: 'FrontendPage', fromName: 'Admin Panel', rel: 'CALLS', toLabel: 'API', toName: 'Admin API' },
  { fromLabel: 'FrontendPage', fromName: 'Support Portal', rel: 'CALLS', toLabel: 'API', toName: 'Support API' },
  { fromLabel: 'FrontendPage', fromName: 'Settings Page', rel: 'CALLS', toLabel: 'API', toName: 'Profile API' },


  { fromLabel: 'Service', fromName: 'Payment Service', rel: 'CALLS', toLabel: 'ExternalService', toName: 'Stripe' },
  { fromLabel: 'Service', fromName: 'Payment Service', rel: 'CALLS', toLabel: 'ExternalService', toName: 'Razorpay' },
  { fromLabel: 'Service', fromName: 'Notification Service', rel: 'CALLS', toLabel: 'ExternalService', toName: 'SendGrid' },
  { fromLabel: 'Service', fromName: 'Shipping Service', rel: 'CALLS', toLabel: 'ExternalService', toName: 'FedEx API' },
  { fromLabel: 'Service', fromName: 'User Service', rel: 'CALLS', toLabel: 'ExternalService', toName: 'AWS S3' },
  { fromLabel: 'Service', fromName: 'Product Service', rel: 'CALLS', toLabel: 'ExternalService', toName: 'AWS S3' },


  { fromLabel: 'API', fromName: 'Login API', rel: 'USES', toLabel: 'Service', toName: 'Authentication Service' },
  { fromLabel: 'API', fromName: 'Login API', rel: 'USES', toLabel: 'Service', toName: 'User Service' },
  { fromLabel: 'API', fromName: 'Register API', rel: 'USES', toLabel: 'Service', toName: 'Authentication Service' },
  { fromLabel: 'API', fromName: 'Register API', rel: 'USES', toLabel: 'Service', toName: 'User Service' },
  { fromLabel: 'API', fromName: 'Products API', rel: 'USES', toLabel: 'Service', toName: 'Product Service' },
  { fromLabel: 'API', fromName: 'Cart API', rel: 'USES', toLabel: 'Service', toName: 'Product Service' },
  { fromLabel: 'API', fromName: 'Cart API', rel: 'USES', toLabel: 'Service', toName: 'User Service' },
  { fromLabel: 'API', fromName: 'Checkout API', rel: 'USES', toLabel: 'Service', toName: 'Payment Service' },
  { fromLabel: 'API', fromName: 'Checkout API', rel: 'USES', toLabel: 'Service', toName: 'Order Service' },
  { fromLabel: 'API', fromName: 'Checkout API', rel: 'USES', toLabel: 'Service', toName: 'Authentication Service' },
  { fromLabel: 'API', fromName: 'Payment API', rel: 'USES', toLabel: 'Service', toName: 'Payment Service' },
  { fromLabel: 'API', fromName: 'Orders API', rel: 'USES', toLabel: 'Service', toName: 'Order Service' },
  { fromLabel: 'API', fromName: 'Profile API', rel: 'USES', toLabel: 'Service', toName: 'User Service' },
  { fromLabel: 'API', fromName: 'Admin API', rel: 'USES', toLabel: 'Service', toName: 'User Service' },
  { fromLabel: 'API', fromName: 'Support API', rel: 'USES', toLabel: 'Service', toName: 'User Service' },
  { fromLabel: 'API', fromName: 'Notification API', rel: 'USES', toLabel: 'Service', toName: 'Notification Service' },
  { fromLabel: 'API', fromName: 'Shipping API', rel: 'USES', toLabel: 'Service', toName: 'Shipping Service' },


  { fromLabel: 'Service', fromName: 'Authentication Service', rel: 'READS', toLabel: 'Database', toName: 'System DB' },
  { fromLabel: 'Service', fromName: 'User Service', rel: 'READS', toLabel: 'Database', toName: 'System DB' },
  { fromLabel: 'Service', fromName: 'Product Service', rel: 'READS', toLabel: 'Database', toName: 'System DB' },
  { fromLabel: 'Service', fromName: 'Order Service', rel: 'READS', toLabel: 'Database', toName: 'System DB' },
  { fromLabel: 'Service', fromName: 'Payment Service', rel: 'READS', toLabel: 'Database', toName: 'System DB' },
  { fromLabel: 'Service', fromName: 'Notification Service', rel: 'READS', toLabel: 'Database', toName: 'System DB' },
  { fromLabel: 'Service', fromName: 'Inventory Service', rel: 'READS', toLabel: 'Database', toName: 'System DB' },
  { fromLabel: 'Service', fromName: 'Shipping Service', rel: 'READS', toLabel: 'Database', toName: 'System DB' },


  { fromLabel: 'API', fromName: 'Checkout API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Cart API' },
  { fromLabel: 'API', fromName: 'Checkout API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Payment API' },
  { fromLabel: 'API', fromName: 'Checkout API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Orders API' },
  { fromLabel: 'API', fromName: 'Checkout API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Notification API' },
  { fromLabel: 'API', fromName: 'Checkout API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Shipping API' },
  { fromLabel: 'API', fromName: 'Payment API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Login API' },
  { fromLabel: 'API', fromName: 'Orders API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Login API' },
  { fromLabel: 'API', fromName: 'Cart API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Products API' },
  { fromLabel: 'API', fromName: 'Shipping API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Orders API' },
  { fromLabel: 'API', fromName: 'Admin API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Login API' },
  { fromLabel: 'API', fromName: 'Support API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Login API' },
  { fromLabel: 'API', fromName: 'Profile API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Login API' },
  { fromLabel: 'API', fromName: 'Register API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Login API' },
  { fromLabel: 'API', fromName: 'Orders API', rel: 'DEPENDS_ON', toLabel: 'API', toName: 'Notification API' },


  { fromLabel: 'Service', fromName: 'Authentication Service', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Authentication Team' },
  { fromLabel: 'Service', fromName: 'User Service', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Authentication Team' },
  { fromLabel: 'Service', fromName: 'Product Service', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Commerce Team' },
  { fromLabel: 'Service', fromName: 'Order Service', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Commerce Team' },
  { fromLabel: 'Service', fromName: 'Payment Service', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Payments Team' },
  { fromLabel: 'Service', fromName: 'Notification Service', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Platform Team' },
  { fromLabel: 'Service', fromName: 'Inventory Service', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Platform Team' },
  { fromLabel: 'Service', fromName: 'Shipping Service', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Logistics Team' },
  { fromLabel: 'API', fromName: 'Login API', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Authentication Team' },
  { fromLabel: 'API', fromName: 'Checkout API', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Commerce Team' },
  { fromLabel: 'API', fromName: 'Payment API', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Payments Team' },
  { fromLabel: 'API', fromName: 'Support API', rel: 'OWNED_BY', toLabel: 'DeveloperTeam', toName: 'Support Team' }
];

async function seed() {
  console.log('--- Starting CodeGraph Seeding Process ---');
  let session;
  try {
    session = getSession();


    const labels = ['FrontendPage', 'API', 'Service', 'Database', 'DeveloperTeam', 'ExternalService'];
    for (const label of labels) {
      console.log(`Setting up uniqueness constraint for node label :${label}...`);
      await session.run(`CREATE CONSTRAINT IF NOT EXISTS FOR (n:${label}) REQUIRE n.name IS UNIQUE`);
    }


    console.log(`Merging ${nodes.length} nodes into the graph...`);
    for (const node of nodes) {
      const query = `
        MERGE (n:${node.label} {name: $name})
        ON CREATE SET n.description = $desc, n.createdAt = datetime()
        ON MATCH SET n.description = $desc
      `;
      await session.run(query, {
        name: node.name,
        desc: node.desc
      });
    }
    console.log('Nodes merged successfully.');

    console.log(`Merging ${relationships.length} directional relationships...`);
    for (const rel of relationships) {
      const query = `
        MATCH (a:${rel.fromLabel} {name: $fromName})
        MATCH (b:${rel.toLabel} {name: $toName})
        MERGE (a)-[r:${rel.rel}]->(b)
      `;
      await session.run(query, {
        fromName: rel.fromName,
        toName: rel.toName
      });
    }
    console.log('Relationships merged successfully.');
    console.log('--- Seeding completed without errors ---');
  } catch (error) {
    console.error('Error during seeding database:', error.message);
    console.warn('NOTE: Ensure your .env contains correct COGNODB connection details and your cloud instance is online.');
  } finally {
    if (session) {
      await session.close();
    }
    await closeDriver();
  }
}

seed();
