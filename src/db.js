import mongoose from 'mongoose';

const uri = process.env.MONGO_URI;
if (!uri) {
    console.error('❌ Falta MONGO_URI en .env');
    process.exit(1);
}

mongoose.set('strictQuery', true);

mongoose
    .connect(uri, { autoIndex: true })
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch((err) => {
        console.error('❌ Error MongoDB:', err?.message || err);
        process.exit(1);
    });
