import reqwest from '../utils/http/reqwest'

export function createRoom(game: string) {
  return reqwest.get('create_room?game=' + game);
}

export function joinRoom(roomNum: string) {
  return reqwest.get('join_room?room=' + roomNum);
}
