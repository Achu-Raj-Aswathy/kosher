const isLogin = async (req,res,next)=>{
    try{
        if(req.session.admin_id){
            next()
        }else{
            res.render('adminLogin',{ adminAlert: "" })
        }
    }
    catch (error){
        console.log(error.message);
    }
}

const isLogout = async (req,res,next)=>{
    try{
        if(req.session.admin_id){
            res.redirect('/admin/login')
        }
        next()
    }
    catch (error){
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}