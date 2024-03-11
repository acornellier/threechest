import localForage from 'localforage'

const db = localForage.createInstance({
  name: 'persist-forage',
})

export const indexedDbStorage = {
  db,
  getItem: db.getItem,
  setItem: db.setItem,
  removeItem: db.removeItem,
}
