import { findAllPlaces } from '../place'
import { findAllCandidatsLean } from '../candidat'
import { places } from './places'
import { candidats } from './candidats'

const makeResa = (place, candidat) => {
  return place.update({ bookedBy: candidat._id })
}

export const makeResas = async () => {
  const placesDb = await findAllPlaces()
  const place1 = placesDb.find(
    place => place.inspecteur === places[0].inspecteur
  )

  const place2 = placesDb.find(
    place => place.inspecteur === places[1].inspecteur
  )
  const candidatsDb = await findAllCandidatsLean()
  const candidat1 = candidatsDb.find(
    candidat => candidat.codeNeph === candidats[0].codeNeph
  )
  const candidat2 = candidatsDb.find(
    candidat => candidat.codeNeph === candidats[1].codeNeph
  )

  return Promise.all([makeResa(place1, candidat1), makeResa(place2, candidat2)])
}

export const NUMBER_RESA = 2
