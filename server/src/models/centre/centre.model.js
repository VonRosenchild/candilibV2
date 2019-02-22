import mongoose from 'mongoose'

const { Schema } = mongoose

const CentreSchema = new Schema({
  nom: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  adresse: {
    type: String,
    required: true,
    trim: true,
  },
  departement: {
    type: String,
    required: true,
    trim: true,
  },
})

CentreSchema.index({ nom: 1, departement: 1 }, { unique: true })

export default mongoose.model('Centre', CentreSchema)
