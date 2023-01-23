const mongoose = require('mongoose')
const express = require('express')
const app = express()
app.use(express.json())

const AgencyDB = require('./models/agency')
const ClientDB = require('./models/client')

try{
    mongoose.connect('mongodb+srv://root:root@cluster0.sipbfgg.mongodb.net/Agency-Client?retryWrites=true&w=majority', {useNewUrlParser: true})
    const db = mongoose.connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('Connected to database'))
}
catch(err){
    console.log('Error:', err)
}

// Create an agency and a client
app.post('/', async (req, res) => {    
    try{
        console.log('API Hit: POST /');
        const newAgency = new AgencyDB({
            AgencyId: req.body.agency.agencyID,
            Name: req.body.agency.name,
            Address1: req.body.agency.address1,
            Address2: req.body.agency.address2,
            State: req.body.agency.state,
            City: req.body.agency.city,
            PhoneNumber: req.body.agency.phoneNumber,
        })
    
        const newClient = new ClientDB({
            ClientId: req.body.client.clientId,
            AgencyId: newAgency.AgencyId,
            Name: req.body.client.name,
            Email: req.body.client.email,
            PhoneNumber: req.body.client.phoneNumber,
            TotalBill: req.body.client.totalBill
        })

        const agency = await newAgency.save()
        const client = await newClient.save()
        res.status(201).json({agency: agency, client: client})
    } catch(err){
        res.status(400).json({message: err.message})
    }
})


// Update a client
app.patch('/:id', async (req, res) => {
    try{
        console.log('API Hit: PATCH /:id');
        const client = await ClientDB.findOneAndUpdate({ClientId: req.params.id}, {Email: req.body.email})
        res.status(201).json(client)
    } catch(err){
        res.status(400).json({message: err.message})
    }
})

// Find clients by AgencyId
app.get('/:id', async (req, res) => {
    try{
        console.log('API Hit: GET /:id');
        const groupByAgencies = await ClientDB.aggregate([
            {
                $group: { _id: "$AgencyId", totalBill: { $sum: "$TotalBill" } }
            }
        ])

        groupByAgencies.sort((a,b) => b.totalBill - a.totalBill)

        const agencyHavingMaxBill = groupByAgencies[0]._id

        const result = await ClientDB.aggregate([
            {
                $match: { AgencyId: agencyHavingMaxBill }
            },
            {
                $group: { _id: "$AgencyId", totalBill: { $sum: "$TotalBill" } }
            }
        ])
        
        res.json(result)
    } catch(err){
        res.status(500).json({message: err.message})
    }
})

// Find all clients
app.get('/', async (req, res) => {
    try{
        console.log('API Hit: GET /');
        const clients = await ClientDB.find()
        res.status(200).json(clients)
    } catch(err){
        res.status(400).json({message: err.message})
    }
})

app.listen(3000, () => {
    console.log('Server is listening on port 3000...')
})