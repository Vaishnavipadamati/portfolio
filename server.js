const express=require('express')
const app=express()
const mongoose= require('mongoose')
const bcrypt=require('bcrypt')
const bodyParser=require('body-parser')
const path =require('path')
const session=require('express-session')
const os=require('os')


//MongoDB
mongoose.connect('mongodb+srv://vaishnavipadamati:2024@cluster0.0iaqkqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',{
    useNewUrlParser:true,
    useUnifiedTopology:true


}).then(()=>{
    console.log('DataBase has been Connected');
})
.catch((error)=>{
    console.log('error',error);
});


 //database creation

const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    subject:String,
    message:String
});
const User=mongoose.model('user',userSchema)

//final check auth
function checkauth(req,res,next){
    if (req.session.user){
        next()
    }
    else{
       res.redirect('/login')
    }
}

//frontend
app.set('view engine','ejs')
app.get('/signup',(req,res)=>{
    res.render('signup')
})
app.use(bodyParser.urlencoded({extended:true}))
app.use('/assets',express.static(path.join(__dirname,'assets')))
app.use(session({
   secret:"3e122888c4c1cf0bb5c57693c582c911e147652389a0e9c55fd2f1820cb163f682f0c490f3a79f1d7fe52a1d83cdd9fc2c0779507bfa95a2019da237ed5be34c",
   resave:false,
   saveUninitialized:false
}))

//signup 

app.post('/signup',async(req,res)=>{
    const {name,email,password}=req.body
    const hashedPassword=await bcrypt.hash(password,10)
    const newUser=new User({name,email,password:hashedPassword})
    await newUser.save()
    res.redirect('/login')
})

//login usage
 app.get('/login',(req,res)=>{
    res.render('login')
 })
 app.post('/login',async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if (user && await bcrypt.compare(password, user.password)){
        req.session.user=user;
        res.render('home',{user})
    }else{
        res.send('invalid user and Password')
    }
 })

 app.get('/home',checkauth,(req,res)=>{
    res.render('home',{user:req.session.user})
 })

 //logout

 app.get('/logout',(req,res)=>{
    req.session.destroy(err=>{
        if(err){
            return redirect('/home');
        }
      res.redirect('/login')
    })
 })

 //homepage
 app.get('/home',(req,res)=>{
    res.render('home')
 })

//home




// Route to handle form submission
app.post('/home', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Example of saving to MongoDB
        const newUser = new User({
            name,
            email,
            subject,
            message
        });
        await newUser.save();

        // Respond with success message
        res.status(200).json({ message: 'Your message has been sent. Thank you!' });
    } catch (error) {
        // Handle errors
        console.error('Error saving to MongoDB:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});




//Server

const port = process.env.PORT || 3000;
const hostname='0.0.0.0';
app.listen(port, hostname, () => {
  console.log(`Server running at http:// ${hostname} on port ${port}/`);
});