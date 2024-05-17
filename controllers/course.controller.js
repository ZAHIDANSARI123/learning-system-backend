import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";
import fs from 'fs/promises';
import cloudinary from 'cloudinary';


/**
 * @ALL_COURSES
 * @ROUTE @GET {{URL}}/api/v1/courses
 * @ACCESS Public
 */
//export
const getAllCourses = async function (req, res, next) {
    // Find all the courses without lectures
    try {
        const courses = await Course.find({}).select('-lectures');

    res.status(200).json({
        success: true,
        message: 'All courses',
        courses,
    }); 
    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
        
    }
   
}

/**
 * @GET_LECTURES_BY_COURSE_ID
 * @ROUTE @POST {{URL}}/api/v1/courses/:id
 * @ACCESS Private(ADMIN, subscribed users only)
 */
// export
const getLecturesByCourseId = async function (req, res, next) {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);
        if(!course) {
            return next(
                new AppError('Invalid course id', 400)
            )
        }

        res.status(200).json({
            success: true, 
            message: 'Course lectures fetched successfully',
            lectures: course.lectures
        });
    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
    }

}

/**
 * @CREATE_COURSE
 * @ROUTE @POST {{URL}}/api/v1/courses
 * @ACCESS Private (admin only)
 */
// export
const createCourse = async  (req, res, next) => {
    const { title, description, category, createBy } = req.body;

    if(!title || !description || !category || !createBy) {
        return next(
            new AppError('All fields are required', 400)
        ) 
    }

        const course = await Course.create({
            title,
            description,
            category, 
            createdBy,
            thumbnail: {
                public_id: 'Dummy',
                secure_url: 'Dummy'
            }
        });

        if (!course) {
            return next(
                new AppError('Course could not created, please try again', 500)
            )
        }
        // Run only if user sends a file
        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: '' // Save files in a folder named 
                });
                if (result) {
                    // Set the public_id and secure_url in array
                    course.thumbnail.public_id = result.public_id;
                    course.thumbnail.secure_url = result.secure_url;
                }
                // After successful upload remove the file from local storage
                fs.rm(`uploads/${req.file.filename}`);
                } catch (e) {
                return next(
                    new AppError(e.message, 500)
                )
            }
        
        // Save the changes    
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course created successfully',
            course,
        });
    }


const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body
            },
            {
                runValidators: true
            }
        );

        if (!course) {
            return next(
                new AppError('Course with given id does not exits', 500)
            )
        }
        res.status(200).json({
            success: true, 
            message: 'Course updated successfully',
            course
        })
    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
    }
}
};

/**
 * @Remove_LECTURE
 * @ROUTE @DELETE {{URL}}/api/v1/courses/:courseId/lectures/:lectureId
 * @ACCESS Private (Admin only)
 */
//export
const removeCourse = async  (req, res, next) => {
    // Grabbing the courseId and lectureId from req.query
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return next(
                new AppError('Course with given id does not exist', 500)
            )
        }
        await course.findByAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        })
        
    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
        
    }

}

/**
 * @ADD_LECTURE
 * @ROUTE @POST {{URL}}/api/v1/courses/:id
 * @ACCESS Private (Admin Only)
 */
// export
const addLectureToCourseById = async (req, res, next) => {
    const { title, description,  } = req.body;
    const { id } = req.params;

    const course =  await Course.findById(id);

    if (!course) {
        return next(
            new AppError('Course with given id does not exits', 500)
        )
    }

    const lectureDate = {
        title,
        description,
        lecture: {}
    };

    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: ''  //file name
            });
            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }
            // After successful upload remove the file from local storage
            fs.rm(`uploads/${req.file.filename}`);
            } catch (e) {
                //Empty the uploads directory without deleting the uploads directory
               //for (const file of await fs.readdir('uploads/')) {
               //await fs.unlink(path.join('uploads/', file));
            return next(
                new AppError(e.message, 500)
            )
        }
        
    }

    course.lectures.push(lecturesDate);

    course.numberOfLectures = course.lectures.length;

    await course.save();

    res.status(200).json({
        success: true, 
        message: 'Lectures successfully added to the courses',
        course
    })
}


const updateCourse = async (req, res, next) => {
    
}


export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById
}