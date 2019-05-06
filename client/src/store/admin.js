import { DateTime } from 'luxon'
import { getFrenchLuxonDateFromIso } from '../util/frenchDateTime.js'

import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const FETCH_ADMIN_INFO_REQUEST = 'FETCH_ADMIN_INFO_REQUEST'
export const FETCH_ADMIN_INFO_FAILURE = 'FETCH_ADMIN_INFO_FAILURE'
export const FETCH_ADMIN_INFO_SUCCESS = 'FETCH_ADMIN_INFO_SUCCESS'

export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST'
export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE'
export const FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS = 'FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS'

export const SELECT_DEPARTEMENT = 'SELECT_DEPARTEMENT'

export default {
  state: {
    departements: {
      active: undefined,
      error: undefined,
      isFetching: false,
      list: [],
    },
    email: undefined,
    placesByCentre: {
      isFetching: false,
      list: [],
    },
  },

  mutations: {
    [FETCH_ADMIN_INFO_REQUEST] (state) {
      state.departements.isFetching = true
    },
    [FETCH_ADMIN_INFO_SUCCESS] (state, infos) {
      state.departements.list = infos.departements
      state.email = infos.email
      state.departements.active = infos.departements[1]
    },
    [FETCH_ADMIN_INFO_FAILURE] (state) {
      state.departements.isFetching = false
    },

    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST] (state) {
      state.placesByCentre.isFetching = true
    },
    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS] (state, list) {
      state.placesByCentre.list = list
    },
    [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE] (state, error) {
      state.placesByCentre.error = error
      state.placesByCentre.isFetching = false
    },

    [SELECT_DEPARTEMENT] (state, departement) {
      state.departements.active = departement
    },
  },

  actions: {
    async [FETCH_ADMIN_INFO_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_ADMIN_INFO_REQUEST)
      try {
        const infos = await api.admin.getMe()
        await commit(FETCH_ADMIN_INFO_SUCCESS, infos)
        dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
      } catch (error) {
        commit(FETCH_ADMIN_INFO_FAILURE)
        return dispatch(SHOW_ERROR, 'Error while fetching admin infos')
      }
    },

    async [FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST] ({ commit, dispatch, state }, begin, end) {
      commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
      try {
        const currentDateTime = DateTime.local().setLocale('fr')
        const weekDay = currentDateTime.weekday
        const beginDate = begin || currentDateTime.plus({ days: -weekDay }).toISO()
        const endDate = end || currentDateTime.plus({ months: 2 }).toISO()
        const placesByCentre = await api.admin
          .getAllPlacesByCentre(state.departements.active, beginDate, endDate)

        const placesByCentreAndWeek = placesByCentre.map(element => ({
          centre: element.centre,
          places: element.places.reduce((acc, place) => {
            const key = getFrenchLuxonDateFromIso(place.date).weekNumber
            const places = { ...acc }
            places[key] = [...(places[key] || []), place]
            return places
          }, {}),
        }))

        commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_SUCCESS, placesByCentreAndWeek)
      } catch (error) {
        commit(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_FAILURE, error)
        return dispatch(SHOW_ERROR, 'Error while fetching departement active infos')
      }
    },

    async [SELECT_DEPARTEMENT] ({ commit, dispatch }, departement) {
      commit(SELECT_DEPARTEMENT, departement)
      dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
    },
  },
}