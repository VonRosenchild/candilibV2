import { connect, disconnect } from '../../mongo-connection'
import {
  findCentresByDepartement,
  findAllCentres,
  findAllActiveCentres,
  findCentreByName,
  findCentreByNameAndDepartement,
  createCentre,
  updateCentreActiveState,
} from './centre-queries'
import {
  setInitCreatedCentre,
  createCentres,
  removeCentres,
  nbCentres,
  centres,
} from '../__tests__/centres'

describe('Centre', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('Create centre', () => {
    it('should not create 2 centres with same name and same department', async () => {
      const nom = 'test.1.centre.nom'
      const label = 'test label'
      const adresse = 'adresse 93001'
      const departement = '93'
      const lon = 48
      const lat = 3

      const centre1Created = await createCentre(
        nom,
        label,
        adresse,
        lon,
        lat,
        departement
      )
      expect(centre1Created).toBeDefined()
      expect(centre1Created).toHaveProperty('nom', nom)
      expect(centre1Created).toHaveProperty('departement', departement)

      const label2 = 'test 2 label'
      const adresse2 = 'adresse 2 93001'

      try {
        await createCentre(nom, label2, adresse2, lon, lat, departement)
        throw new Error()
      } catch (error) {
        expect(error).toHaveProperty('name', 'MongoError')
        expect(error.message).toMatch(/duplicate key error dup key/)
      }

      await centre1Created.remove()
    })

    it('should add 2 centres with same name', async () => {
      const nom = 'test.1.centre.nom'
      const label = 'test label'
      const adresse = 'adresse 93000'
      const departement1 = '93'
      const departement2 = '94'
      const lon = 45
      const lon2 = 47
      const lat = 4
      const lat2 = 2

      const centre1Created = await createCentre(
        nom,
        label,
        adresse,
        lon,
        lat,
        departement1
      )
      expect(centre1Created).toBeDefined()
      expect(centre1Created).toHaveProperty('nom', nom)
      expect(centre1Created).toHaveProperty('departement', departement1)

      const centre2Created = await createCentre(
        nom,
        label,
        adresse,
        lon2,
        lat2,
        departement2
      )

      expect(centre2Created).toBeDefined()
      expect(centre2Created).toHaveProperty('nom', nom)
      expect(centre2Created).toHaveProperty('departement', departement2)

      await centre1Created.remove()
      await centre2Created.remove()
    })
  })

  describe('Find centre', () => {
    beforeAll(async () => {
      setInitCreatedCentre()
      await createCentres()
    })

    afterAll(async () => {
      await removeCentres()
    })

    it('Should find one centres by name', async () => {
      const centresResult = await findCentreByName(centres[2].nom)
      expect(centresResult).toBeDefined()
      expect(centresResult).not.toBeNull()
      expect(centresResult).toHaveProperty('nom', centres[2].nom)
      expect(centresResult).toHaveProperty('label', centres[2].label)
      expect(centresResult).toHaveProperty('adresse', centres[2].adresse)
      expect(centresResult).toHaveProperty(
        'departement',
        centres[2].departement
      )
    })

    it('Should find all centres, there are 3 centres', async () => {
      const centresResult = await findAllActiveCentres()
      expect(centresResult).toBeDefined()
      expect(centresResult).not.toBeNull()
      expect(centresResult).toHaveLength(nbCentres())
    })

    it('Should find 2 centres from 93', async () => {
      const departement = '93'
      const centresResult = await findCentresByDepartement(departement)
      expect(centresResult).toBeDefined()
      expect(centresResult).toHaveLength(nbCentres(departement))
    })

    it('Should find one centre by departement and name', async () => {
      const departement = '93'
      try {
        const centresResult = await findCentreByNameAndDepartement(
          centres[2].nom,
          departement
        )
        expect(centresResult).toBeDefined()
        expect(centresResult).toHaveProperty('nom', centres[2].nom)
        expect(centresResult).toHaveProperty('departement', departement)
      } catch (error) {
        expect(error).toBeUndefined()
      }
    })
  })

  describe('Disable centre', () => {
    beforeAll(async () => {
      setInitCreatedCentre()
      await createCentres()
    })

    afterAll(async () => {
      await removeCentres()
    })
    it('Should disable one centre', async () => {
      const testCentre = await findCentreByNameAndDepartement(
        centres[2].nom,
        centres[2].departement
      )
      const centreResult = await updateCentreActiveState(
        testCentre,
        false,
        'onepiece@madmax.com'
      )

      const unableToFindCentre = await findCentreByNameAndDepartement(
        centres[2].nom,
        centres[2].departement
      )
      const allCentres = await findAllCentres()
      const disabledCentre = allCentres.filter(centre => !centre.active)[0]

      expect(testCentre).toBeDefined()
      expect(testCentre).not.toBeNull()
      expect(testCentre).toHaveProperty('nom', centres[2].nom)
      expect(testCentre).toHaveProperty('label', centres[2].label)

      expect(centreResult).toBeDefined()
      expect(centreResult).not.toBeNull()
      expect(centreResult).toHaveProperty('nom', centres[2].nom)
      expect(centreResult).toHaveProperty('label', centres[2].label)

      expect(unableToFindCentre).toBeDefined()
      expect(unableToFindCentre).toBeNull()

      expect(disabledCentre).toBeDefined()
      expect(disabledCentre).not.toBeNull()
      expect(disabledCentre).toHaveProperty('nom', centres[2].nom)
      expect(disabledCentre).toHaveProperty('label', centres[2].label)
      expect(disabledCentre).toHaveProperty('active', false)
      expect(disabledCentre).toHaveProperty('disabledBy', 'onepiece@madmax.com')
      expect(disabledCentre.disabledAt).toBeInstanceOf(Date)
    })

    it('Should enable one centre', async () => {
      const allCentres = await findAllCentres()
      const disabledCentre = allCentres.filter(centre => !centre.active)[0]

      await updateCentreActiveState(disabledCentre, true)

      const enabledCentre = await findCentreByNameAndDepartement(
        centres[2].nom,
        centres[2].departement
      )

      expect(enabledCentre).toBeDefined()
      expect(enabledCentre).not.toBeNull()
      expect(enabledCentre).toHaveProperty('nom', centres[2].nom)
      expect(enabledCentre).toHaveProperty('label', centres[2].label)
      expect(enabledCentre).toHaveProperty('active', true)
    })
  })
})
