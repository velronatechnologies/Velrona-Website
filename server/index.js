import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = "mongodb+srv://ramji:Ramji23112005@cluster0.ln4g5.mongodb.net/velrona";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demnzc2ct',
  api_key: process.env.CLOUDINARY_API_KEY || '871927416829761',
  api_secret: process.env.CLOUDINARY_API_SECRET || '17dx_wkO7nHZnAvhvSK-7nB1hoQ'
});

// Configure Multer storage for image uploads
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'velrona_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// Configure Multer storage for PDF uploads
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'velrona_uploads/pdfs',
    allowed_formats: ['pdf'],
    resource_type: 'image',
  },
});

const imageUpload = multer({ storage: imageStorage });
const pdfUpload = multer({ storage: pdfStorage });

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const contentSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  pdf: String,
  date: String,
  category: String,
  communityType: String,
  group: String,
  pinned: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  sections: [{
    text: String,
    image: String,
  }],
  stats: [{
    label: String,
    value: String,
  }],
  grayImage: String,
  tagline: String,
  shortDescription: String,
});

const Content = mongoose.model('Content', contentSchema);

// Signature Doc Schema
const signatureDocSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  pdfUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SignatureDoc = mongoose.model('SignatureDoc', signatureDocSchema);

// Signature Submission Schema
const signatureSubmissionSchema = new mongoose.Schema({
  docId: { type: mongoose.Schema.Types.ObjectId, ref: 'SignatureDoc', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  dateSigned: { type: String, required: true },
  signatureData: { type: String, required: true },
  signedPdfUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const SignatureSubmission = mongoose.model('SignatureSubmission', signatureSubmissionSchema);

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || 'admin@velrona';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Velrona@dharun';

// Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const userId = (req.body.userId || '').trim();
  const password = (req.body.password || '').trim();

  if (!userId || !password) {
    return res.status(400).json({ error: 'User ID and password are required' });
  }

  if (userId === ADMIN_USER_ID && password === ADMIN_PASSWORD) {
    const token = 'velrona_auth_' + Buffer.from(`${userId}:${Date.now()}`).toString('base64');
    return res.json({
      success: true,
      token,
      userId: ADMIN_USER_ID
    });
  }

  return res.status(401).json({ error: 'Invalid User ID or Password' });
});

// Admin Verify Endpoint
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer velrona_auth_')) {
    return res.json({ authenticated: true });
  }
  return res.status(401).json({ authenticated: false });
});

// Image Upload Endpoint
app.post('/api/upload/image', (req, res) => {
  imageUpload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary Error:', err);
      return res.status(500).json({
        error: 'Upload failed',
        details: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File successfully uploaded to Cloudinary:', req.file.path);
    res.json({ secure_url: req.file.path });
  });
});

// Configure Multer storage for PDF uploads (Memory storage for streaming to Cloudinary)
const memoryStorage = multer.memoryStorage();
const pdfMemoryUpload = multer({ storage: memoryStorage });

// PDF Upload Endpoint (Investors)
app.post('/api/upload/pdf', (req, res) => {
  pdfMemoryUpload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer PDF Error:', err);
      return res.status(500).json({ error: err.message || 'Multer PDF upload error' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No file buffer received' });
    }

    // 1. Try Cloudinary Upload
    try {
      const cloudinaryResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'velrona_uploads/pdfs',
            resource_type: 'auto',
          },
          (cloudinaryErr, result) => {
            if (cloudinaryErr || !result) reject(cloudinaryErr || new Error('No result returned'));
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      if (cloudinaryResult && cloudinaryResult.secure_url) {
        console.log('PDF successfully uploaded to Cloudinary:', cloudinaryResult.secure_url);
        return res.json({ secure_url: cloudinaryResult.secure_url });
      }
    } catch (cErr) {
      console.warn('Cloudinary upload failed, falling back to local server storage:', cErr?.message || cErr);
    }

    // 2. Fallback: Save to Local Server Storage or Data URI (for serverless environments)
    try {
      const uploadsDir = path.join(__dirname, 'uploads/pdfs');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filename = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);

      const localUrl = `/uploads/pdfs/${filename}`;
      console.log('PDF successfully saved to local server disk:', localUrl);
      return res.json({ secure_url: localUrl });
    } catch (diskErr) {
      console.warn('Disk write failed (serverless environment), returning Data URI fallback:', diskErr?.message);
      const base64Pdf = req.file.buffer.toString('base64');
      const dataUri = `data:application/pdf;base64,${base64Pdf}`;
      return res.json({ secure_url: dataUri });
    }
  });
});

// Admin Pushing Content
app.post('/api/content', async (req, res) => {
  try {
    const newContent = new Content(req.body);
    await newContent.save();
    res.status(201).json(newContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save content' });
  }
});

// Fetching ALL Content regardless of category
app.get('/api/content/all_types', async (req, res) => {
  try {
    const items = await Content.find({}).sort({ order: 1, _id: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Fetching Content by Category
app.get('/api/content/:category', async (req, res) => {
  try {
    const filter = { category: req.params.category };
    const pinnedFirst = req.query.pinnedFirst === 'true';

    if (req.params.category === 'community' && req.query.communityType) {
      filter.communityType = req.query.communityType;
    }

    let sortOptions = {};
    if (req.params.category === 'investor_businesses') {
      sortOptions = { order: 1, _id: -1 };
    } else if (pinnedFirst) {
      sortOptions = { pinned: -1, _id: -1 };
    } else {
      sortOptions = { _id: -1 };
    }

    const items = await Content.find(filter).sort(sortOptions);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Toggle pin status for a content item
app.patch('/api/content/:id/pin', async (req, res) => {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.pinned = !item.pinned;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle pin status' });
  }
});

// Fetching Single Content Item by ID
app.get('/api/content/item/:id', async (req, res) => {
  try {
    const item = await Content.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Update Content Item
app.put('/api/content/:id', async (req, res) => {
  try {
    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Delete Content Item
app.delete('/api/content/:id', async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// Create Signature Doc (Admin)
app.post('/api/signature-docs', async (req, res) => {
  try {
    const { title, description, pdfUrl } = req.body;
    if (!title || !pdfUrl) {
      return res.status(400).json({ error: 'Title and PDF document URL are required' });
    }
    const newDoc = new SignatureDoc({ title, description, pdfUrl });
    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create signature document' });
  }
});

// Fetch all Signature Docs (Admin)
app.get('/api/signature-docs', async (req, res) => {
  try {
    const docs = await SignatureDoc.find({}).sort({ _id: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch signature documents' });
  }
});

// Fetch single Signature Doc by ID (Public Investor Sign Page)
app.get('/api/signature-docs/:id', async (req, res) => {
  try {
    const doc = await SignatureDoc.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Delete Signature Doc (Admin)
app.delete('/api/signature-docs/:id', async (req, res) => {
  try {
    await SignatureDoc.findByIdAndDelete(req.params.id);
    await SignatureSubmission.deleteMany({ docId: req.params.id });
    res.json({ message: 'Document and signatures deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Submit Investor Signature (Public Investor Sign Page)
app.post('/api/signature-submissions', async (req, res) => {
  try {
    const { docId, fullName, email, dateSigned, signatureData } = req.body;
    if (!docId || !fullName || !email || !signatureData) {
      return res.status(400).json({ error: 'All fields including signature are required' });
    }

    const doc = await SignatureDoc.findById(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    let signedPdfUrl = doc.pdfUrl;

    try {
      // 1. Fetch original PDF bytes
      let pdfBytes;
      if (doc.pdfUrl.startsWith('data:application/pdf;base64,')) {
        const base64Str = doc.pdfUrl.replace(/^data:application\/pdf;base64,/, '');
        pdfBytes = new Uint8Array(Buffer.from(base64Str, 'base64'));
      } else if (doc.pdfUrl.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, doc.pdfUrl.replace(/^\/uploads\//, 'uploads/'));
        if (fs.existsSync(localPath)) {
          pdfBytes = fs.readFileSync(localPath);
        }
      }

      if (!pdfBytes) {
        const fetchRes = await fetch(doc.pdfUrl);
        const arrayBuffer = await fetchRes.arrayBuffer();
        pdfBytes = new Uint8Array(arrayBuffer);
      }

      if (pdfBytes) {
        // 2. Load PDF with pdf-lib & stamp signature block on the LAST PAGE (bottom-right)
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Target the last page of the document instead of creating a separate page
        const pages = pdfDoc.getPages();
        const sigPage = pages.length > 0 ? pages[pages.length - 1] : pdfDoc.addPage([595, 842]);
        const { width, height } = sigPage.getSize();

        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // 3. Embed drawn signature PNG/JPG
        const signatureImageBytes = Buffer.from(signatureData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        let signatureImage;
        if (signatureData.includes('image/jpeg') || signatureData.includes('image/jpg')) {
          signatureImage = await pdfDoc.embedJpg(signatureImageBytes);
        } else {
          signatureImage = await pdfDoc.embedPng(signatureImageBytes);
        }

        const rawDims = signatureImage.scale(1.0);
        const maxSigW = 160;
        const maxSigH = 50;
        const scaleFactor = Math.min(maxSigW / rawDims.width, maxSigH / rawDims.height, 1.0);
        const sigW = rawDims.width * scaleFactor;
        const sigH = rawDims.height * scaleFactor;

        // Position Signature Box on the Bottom-Right of the Last Page dynamically
        const companyTitle = "For VELRONA TECHNOLOGIES PRIVATE LIMITED";
        const companyTitleSize = 9;
        const companyTitleWidth = helveticaBold.widthOfTextAtSize(companyTitle, companyTitleSize);

        const rightMargin = 30;
        const boxWidth = Math.max(240, companyTitleWidth + 10);
        const startX = Math.max(20, width - rightMargin - boxWidth); // Responsive right-aligned positioning
        const startY = 45; // 45pt from the bottom of the page

        // 1. Company Header Title
        const titleX = startX + (boxWidth - companyTitleWidth) / 2;
        sigPage.drawText(companyTitle, {
          x: titleX,
          y: startY + 120,
          size: companyTitleSize,
          font: helveticaBold,
          color: rgb(0.06, 0.09, 0.16),
        });

        // 2. Draw Signature Image (Centered in signature block)
        const sigImgX = startX + (boxWidth - sigW) / 2;
        sigPage.drawImage(signatureImage, {
          x: sigImgX,
          y: startY + 60,
          width: sigW,
          height: sigH,
        });

        // 3. Signatory Name
        const nameText = fullName.toUpperCase();
        const nameSize = 9;
        const nameWidth = helveticaBold.widthOfTextAtSize(nameText, nameSize);
        sigPage.drawText(nameText, {
          x: startX + (boxWidth - nameWidth) / 2,
          y: startY + 44,
          size: nameSize,
          font: helveticaBold,
          color: rgb(0.1, 0.15, 0.25),
        });

        // 4. Authorised Signatory subtitle (Removed "Director / ")
        const subtitleText = "Authorised Signatory";
        const subtitleSize = 8.5;
        const subtitleWidth = helveticaBold.widthOfTextAtSize(subtitleText, subtitleSize);
        sigPage.drawText(subtitleText, {
          x: startX + (boxWidth - subtitleWidth) / 2,
          y: startY + 30,
          size: subtitleSize,
          font: helveticaBold,
          color: rgb(0.2, 0.25, 0.3),
        });

        // 5. Digital Verification details & Date
        const dateStr = dateSigned || new Date().toLocaleDateString('en-GB');
        const metaText = `Signed: ${dateStr} • ${email}`;
        let metaSize = 7;
        let metaWidth = helvetica.widthOfTextAtSize(metaText, metaSize);
        if (metaWidth > boxWidth) {
          metaSize = Math.min(7, (boxWidth / metaWidth) * 6.5);
          metaWidth = helvetica.widthOfTextAtSize(metaText, metaSize);
        }
        sigPage.drawText(metaText, {
          x: Math.max(20, startX + (boxWidth - metaWidth) / 2),
          y: startY + 16,
          size: metaSize,
          font: helvetica,
          color: rgb(0.4, 0.45, 0.5),
        });

        // 5. Save stamped PDF
        const modifiedPdfBytes = await pdfDoc.save();

        try {
          const uploadsDir = path.join(__dirname, 'uploads/pdfs');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const signedFilename = `signed_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
          const signedFilePath = path.join(uploadsDir, signedFilename);
          fs.writeFileSync(signedFilePath, modifiedPdfBytes);
          signedPdfUrl = `/uploads/pdfs/${signedFilename}`;
        } catch (fileErr) {
          console.warn('Serverless environment file write, returning Data URI for signed PDF:', fileErr?.message);
          const base64Signed = Buffer.from(modifiedPdfBytes).toString('base64');
          signedPdfUrl = `data:application/pdf;base64,${base64Signed}`;
        }

        console.log('Successfully created stamped signed PDF Certificate!');
      }
    } catch (stampErr) {
      console.error('PDF Signature Stamping error:', stampErr);
    }

    const submission = new SignatureSubmission({
      docId,
      fullName,
      email,
      dateSigned: dateSigned || new Date().toLocaleDateString('en-GB'),
      signatureData,
      signedPdfUrl,
    });
    await submission.save();

    res.status(201).json(submission);
  } catch (err) {
    console.error('Signature submission error:', err);
    res.status(500).json({ error: 'Failed to save signature submission' });
  }
});

// Fetch Submissions for a Document (Admin)
app.get('/api/signature-submissions/doc/:docId', async (req, res) => {
  try {
    const submissions = await SignatureSubmission.find({ docId: req.params.docId }).sort({ _id: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found: Please run "npm run build" to generate the frontend build artifacts.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
