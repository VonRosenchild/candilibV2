import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'
import {
  createCandidats,
  createCentres,
  createPlaces,
  deleteCandidats,
  removeCentres,
  removePlaces,
  setInitCreatedCentre,
  resetCreatedInspecteurs,
  setInitCreatedPlaces,
} from '../../models/__tests__'

// import { getActiveGeoDepartementsInfos } from './departements-controllers'

jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')
jest.mock('../../util/token')

require('../../util/logger').setWithConsole(false)

describe('Test get dates from places available', () => {
  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()

    await connect()
    const createdCandidats = await createCandidats()
    await createCentres()
    await createPlaces()
    require('../middlewares/verify-token').__setIdCandidat(
      createdCandidats[0]._id
    )
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()
    await disconnect()
    await app.close()
  })

  it('should have two departements, 92 with 1 centre / 1 place and 93 with 2 centres / 6 places', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/departements`)
      .set('Accept', 'application/json')
      .expect(200)
    console.log(body.geoDepartementsInfos[0])
    console.log(body.geoDepartementsInfos[0].centres)
    body.geoDepartementsInfos[0].centres.map(el => {
      console.log({ el })
    })
    console.log(body.geoDepartementsInfos[0].centres.length)
    console.log(body.geoDepartementsInfos[1])
    console.log(body.geoDepartementsInfos[1].centres.length)
    const { geoDepartementsInfos } = body

    // const expectedArray = []
    console.log({ geoDepartementsInfos })

    // expect(geoDepartementsInfos).toEqual(
    //   expect.arrayContaining(expectedArray)
    // )

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('geoDepartementsInfos')
    expect(geoDepartementsInfos).toHaveLength(2)
    expect(geoDepartementsInfos[0]).toHaveProperty('count', 1)
    expect(geoDepartementsInfos[0]).toHaveProperty('centres')
    expect(geoDepartementsInfos[0].centres).toHaveLength(1)
    expect(geoDepartementsInfos[1]).toHaveProperty('count', 6)
    expect(geoDepartementsInfos[1]).toHaveProperty('centres')
    expect(geoDepartementsInfos[1].centres).toHaveLength(2)
  })
})