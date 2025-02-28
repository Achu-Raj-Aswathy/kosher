const viewHomepage = async(req,res)=>{
    try {
        res.render('user/userHome',{})
    } catch (error) {
        console.error(error)
        res.render('error',{error})
    }
}
const viewRoomList = async(req,res)=>{
    try {
        res.render('user/roomList',{})
    } catch (error) {
        console.error(error)
        res.render('error',{error})
    }
}

const viewRoomDetails = async(req,res)=>{
    try {
        res.render('user/roomDetails',{})
    } catch (error) {
        console.error(error)
        res.render('error',{error})
    }
}

const viewGallery = async(req,res)=>{
    try {
        res.render('user/gallery',{})
    } catch (error) {
        console.error(error)
        res.render('error',{error})
    }
}

const viewContact = async(req,res)=>{
    try {
        res.render('user/contact',{})
    } catch (error) {
        console.error(error)
        res.render('error',{error})
    }
}

const viewReservation = async(req,res)=>{
    try {
        res.render('user/reservation',{})
    } catch (error) {
        console.error(error)
        res.render('error',{error})
    }
}

const viewAbout = async(req,res)=>{
    try {
        res.render('user/about',{})
    } catch (error) {
        console.error(error)
        res.render('error',{error})
    }
}

const viewServices = async(req,res)=>{
    try {
        res.render('user/services',{})
    } catch (error) {
        console.error(error)
        res.render('error',{error})
    }
}

module.exports={
    viewHomepage,
    viewRoomList,
    viewRoomDetails,
    viewGallery,
    viewContact,
    viewReservation,
    viewAbout,
    viewServices,
}