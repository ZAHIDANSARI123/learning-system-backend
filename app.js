import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
config();


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// middlewares
// Built-in
app.use(express.json());

// third-party
app.use(cors({
              origin: [process.env.FRONTEND_URL],
              credentials: true
}));

app.use(cookieParser());

app.use(morgan('dev'));


// serve status check route
app.use('/ping', function (req,res){
              res.send('pong')
})


// Import all routes
// import userRoutes from './routes/user.routes.js';
// import courseRoutes from './routes/course.routes.js';
// import paymentRoutes from './routes/payment.routes.js';
// import miscRoutes from './routes/miscellaneous.routes.js';

app.use('/api/v1/user', userRoutes)
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', userRoutes);
// app.use('api/v1/', miscRoutes);

app.all('*', (req,res) => {
    res.status(404).send('OOPS!! 404 page not found')
})

app.use(errorMiddleware);

export default app;

