const admin = require('firebase-admin');
require('dotenv').config();

let firebaseApp = null;

function initializeFirebase() {
  try {
    if (!firebaseApp) {
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || 'next-6cfd1',
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '4b380f95c0b46f560d4ab47bb7807e54f82d58be',
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDP0UHfrXuvS3i1
5B0Btb5T84CpgHvWSzSXUxCdnLqG41o05MvdRWHBooENPtDC80QRlGG+ag9L7joO
ydiRx1qx3nYzsgMg+Ho3IlMZZkJxOws69kyOXwL7f4Ixj61TzjmnoT6GthStdcPO
EEOW4cuvMqyVPHb6u36LF5gC6N+dfKGeCH2zVZmVYnX9wn7vGKQG7O/1G3igwyJG
dEM+db6yDaPVhX2L9G8iE7EWRlkOKECRJ21xjuLU4YmBMI2+zID5ZC4L2p7XP7yz
zZPYM0Wc5f1r5Q4HH2vBjw1FvQr4Araf7HzUwlbATbgtcIhwcRwP6rMvDWC4Kk9r
e+Fch+nDAgMBAAECggEAG3hmw8Fz4wUP7MM9jldO1FwQutcwB3CjgAlL3fm0slXl
O66uwA4G0QjBFFYkVFDBw60gioIMiZXw+Ll3tjVq6K4mY8j5HueZiCYyY94flEYg
wueB0SQACeyd8h0y5SwSdPUchcQV0aQKgPenZ49rVDpXk9aNR7F3Fb3Fq0TLIk71
CrQUH7sUGnZ9lRvVYPblYGvDR5Wiooz0PCPsQNRMZ2P0d8SCMDmJ7WOfx/gMczYZ
Ecf69zgvTTlCOm2UMooDZLj84fbjtZhLNZip7fphTSoCnih2FzYKoDiqQuI7+w3H
jw1tiwQ43db0NQv8nP5e6sPCVMSSbtBGVOcFFOl7wQKBgQD40IVutOnbjXTfstfi
Tc9jvDr3HsIA/4G/Zm/twCXaqk5jxawGZin82G0jjt2nSTAvYHnjksaIVEJYG1m8
y8bUqE6ZOX5ZweGwoM8fjDnQ/VlYKEDseLBDx9aeYvVoU5SAEtAF8lUFW/pq93sp
RQNdUoZSFc5t2VCZMVyGRwWgYwKBgQDV0aVBDw1U9hde7QzgZXeEkx7YvBTIzQhU
ZG4dYinK68+RCi0nsWXKlo4ypGdLCuZjKwg86eOsOnOIZ7Tfi0MzQRYBt+tG0Aps
eQH0jvyjiLoSZBX0PCGARBd0bNtZjePlf3WDbjXD/RvzhgkuUo384akkPNP/cqS4
/+WN+QjfIQKBgQDvx1vfXT9FEuQ/s8UyVJP45GvavGxvs8ug3SIed57DRH54zgVC
wW/TN+qtar+WuARUk9/C/S6QMMsix3DKbYK2a2Abb3mhHCPYKJCSMXuCOLTCLUCr
4n7TQyFDz8/58xnX9sk8AdYHbSU9sjOhiN1+MMo7DsK5v8RZbWViDc2RSwKBgFgl
EdQNKXjR7naCkKFdEvVDVR8SAht5cqqfsElKs2Hk7m+jW1QWrJjkkgBMiAyGlM1i
6wV5ghL5EbG01vqkxXI2raTNth8+Gl33UJgJ7hpYfiSgv/Asbb8b0vN7AL4dYUq1
zbL91wpRqJkus1A2VjRersSyks6m60McsvxhIoghAoGBAOcZdiUizBvKBmjDydPN
J87H4q+Kb/EKR3J1QPxF4fdu44EjCK3Nqz0N5ah5JqV39SWICZPprVOJsDIC7iEZ
79ns81eY1J/F6pr7/RcraIRgt4aOvbFoKOBuIfeo4gNS8FxUw1LjnBy/I94Ygt/1
qkvQrMwsBuqC/6pwMfI6RF9p
-----END PRIVATE KEY-----`,
        client_email: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@next-6cfd1.iam.gserviceaccount.com',
        client_id: process.env.FIREBASE_CLIENT_ID || '115024405331932800837',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40next-6cfd1.iam.gserviceaccount.com',
        universe_domain: 'googleapis.com'
      };

      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        console.warn('⚠️ Firebase credentials not fully configured. Google login will not work.');
        return null;
      }

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('✅ Firebase initialized successfully');
    }
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return null;
  }
}

async function verifyFirebaseToken(idToken) {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token: ' + error.message);
  }
}

function isAllowedGoogleDomain(email) {
  const allowedDomains = process.env.ALLOWED_GOOGLE_DOMAINS?.split(',').map(d => d.trim()) || [];
  
  // If no domains are specified, allow all domains
  if (allowedDomains.length === 0) {
    console.log('No Google domain restrictions - allowing all domains');
    return true;
  }

  const domain = email.split('@')[1];
  const isAllowed = allowedDomains.includes(domain);
  
  console.log(`Checking domain ${domain} against allowed domains:`, allowedDomains);
  console.log(`Domain ${domain} is ${isAllowed ? 'allowed' : 'not allowed'}`);
  
  return isAllowed;
}

module.exports = {
  initializeFirebase,
  verifyFirebaseToken,
  isAllowedGoogleDomain,
};
