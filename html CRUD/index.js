const express = require('express');
const app = express();
const port = process.env.port || 3000;

//Model and databases
const mong = require("mongoose");
mong.connect("mongodb://127.0.0.1:27017/AdmitEase_MongoDb",{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log("database connected successfully done bro");
}).catch((e)=>{
    console.log("not bro");
})

app.use(express.static('public'));

// Middleware
app.use(express.urlencoded({ extended: true }));

// Set up EJS templating engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  // Render your HTML file with EJS
  res.render('index');
});

const db = mong.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

//table 1 = signUp
const signUp=new mong.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
});
const Register_signUp = new mong.model("signUp",signUp)
module.exports  = Register_signUp;

// Handle form submission
app.post('/addData', async (req, res) => {
    try{
        const inserting = new Register_signUp({
            name:req.body.name,
            email:req.body.email,
        })
        const register1 = await inserting.save();
        res.status(201).render(index);
    }catch(error){
        res.status(400).send(error);
    }
});



app.get('/seeData', async (req, res) => {
    try {
        // Retrieve data from MongoDB using your model
        const records = await Register_signUp.find(); // Change this to your actual model

        // Generate an HTML table dynamically
        let tableHTML = '<table>';
        tableHTML += '<thead><tr><th>name</th><tr><th>email</th><th>Action</th></thead>';
        tableHTML += '<tbody>';

        // Loop through the records and add rows to the table
        records.forEach((record) => {
            tableHTML += `<tr><td>${record.name}</td><td>${record.email}</td><td><button onclick="deleteRecord('${record._id}')">Delete</button></td></tr>`;
            // Add more columns as needed
        });

        tableHTML += '</tbody></table>';

        // Add a JavaScript function to handle record deletion
        tableHTML += `
            <script>
                function deleteRecord(id) {
                    fetch('/delete_record/' + id, {
                        method: 'DELETE'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Reload the page or update the table as needed
                            window.location.reload();
                        } else {
                            alert('Failed to delete the record.');
                        }
                    });
                }
            </script>
        `;

        // Send the HTML table as the response
        res.send(tableHTML);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Add a route to handle record deletion
app.delete('/delete_record/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Perform the deletion operation using your model
        await Register_signUp.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



// Start the server
app.listen(port, () => {
    console.log('Server(Website) is running');
  });