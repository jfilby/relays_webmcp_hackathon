// Temporary DM realtime smoke test
import { io } from 'socket.io-client'

function connectClient() {
  return new Promise((resolve, reject) => {
    const socket = io('http://localhost:3002', { path: '/socket.io' })
    const timer = setTimeout(() => reject(new Error('connect timeout')), 5000)
    socket.on('connect', () => { clearTimeout(timer); resolve(socket) })
    socket.on('connect_error', (err) => { clearTimeout(timer); reject(err) })
  })
}

const joinRoom = (socket, userProfileId) =>
  new Promise(res => socket.emit('dm:join', { userProfileId }, r => res(r)))

const emitAck = (socket, event, payload) =>
  new Promise(resolve => socket.emit(event, payload, (result) => resolve(result)))

const alice = await connectClient()
const ben = await connectClient()
console.log('both connected')

const ja = await joinRoom(alice, 'cmta7b8ht0000d5ij8abvc9zo')   // jason-filby
const jb = await joinRoom(ben, 'cmte2uqfn0003ivijl0jbz2l1')     // ben-oduor-demo
const received = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('no dm:message received')), 5000)
  ben.on('dm:message', (payload) => { clearTimeout(timer); resolve(payload) })
})

const sendAck = await emitAck(alice, 'dm:send', {
  userProfileId: 'cmta7b8ht0000d5ij8abvc9zo',
  toProfilePublicId: 'ben-oduor-demo',
  message: 'Hello Ben! DM feature test.'
})
console.log('send ack:', JSON.stringify(sendAck))

const msg = await received
console.log('ben got:', JSON.stringify(msg))

const badAck = await emitAck(alice, 'dm:send', {
  userProfileId: 'cmta7b8ht0000d5ij8abvc9zo',
  toProfilePublicId: 'nonexistent-x',
  message: 'hi'
})
console.log('bad recipient ack:', JSON.stringify(badAck))

alice.disconnect()
ben.disconnect()
console.log('SMOKE TEST PASSED')
