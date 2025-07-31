// Mock database for development when MongoDB isn't configured
let games = {}

export const mockDb = {
  games: {
    insertOne: async (game) => {
      games[game.roomCode] = { ...game, _id: game.roomCode }
      return { insertedId: game.roomCode }
    },
    
    findOne: async (query) => {
      if (query.roomCode) {
        const game = games[query.roomCode]
        if (!game) return null
        
        // Handle status filter
        if (query.status && query.status.$ne) {
          if (game.status === query.status.$ne) return null
        }
        
        return game
      }
      return null
    },
    
    updateOne: async (query, update) => {
      if (query.roomCode && games[query.roomCode]) {
        if (update.$push) {
          Object.keys(update.$push).forEach(key => {
            if (!games[query.roomCode][key]) games[query.roomCode][key] = []
            games[query.roomCode][key].push(update.$push[key])
          })
        }
        if (update.$set) {
          Object.keys(update.$set).forEach(key => {
            if (key.includes('.')) {
              // Handle nested updates like players.0.selected
              const [parent, index, field] = key.split('.')
              if (games[query.roomCode][parent] && games[query.roomCode][parent][index]) {
                games[query.roomCode][parent][index][field] = update.$set[key]
              }
            } else {
              games[query.roomCode][key] = update.$set[key]
            }
          })
        }
        return { modifiedCount: 1 }
      }
      return { modifiedCount: 0 }
    }
  }
}