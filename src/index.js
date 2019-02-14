

state = {
    p1: {
        life: null,
        deck: deck1,
        hand: [],
        field: [],
        currentCard: null,
        drawnCard: false,
        turnSummonedMonsters: 0
    },
    p2: {
        life: null,
        deck: deck2,
        hand: [],
        field: [],
        currentCard: null,
        drawnCard: false,
        turnSummonedMonsters: 0
    },
    inplay: []
}

p1 = state.p1
p2 = state.p2

const myLifeCounter = document.querySelector('.my-lifepoints')
const oppLifeCounter = document.querySelector('.opp-lifepoints')

gameStart = () => {
    p1.life = 4000
    p2.life = 4000
    myLifeCounter.innerText = `Your Lifepoints: ${p1.life}`
    oppLifeCounter.innerText = `Oppostion Lifepoints: ${p2.life}`
}


//DISPLAYING CARDS 

//Hand
const handEl = document.querySelector('#my-hand')

//My Helper functions

addToHandState = card => {
    p1.hand.push(card)
}

addToFieldState = card => {
    p1.field.push(card)
    state.inplay.push(card)
}

removeFromHand = card => {
    p1.hand = p1.hand.filter(c => c !== card)
    renderHandCards(p1.hand)
}

removeFromFieldState = card => {
    p1.field = p1.field.filter(c => c !== card)
}

startingHand = () => {
    for (let i = 0; i < 3; i++) {
        card = p1.deck.pop()
        renderHandCard(card)
        addToHandState(card)
    }
}

renderHandCard = card => {
    cardImg = document.createElement('img')
    cardImg.src = card.image_url
    cardImg.id = card.id
    handEl.appendChild(cardImg)
}

renderHandCards = cards => {
    handCards.innerHTML = ''
    cards.forEach(card => {
        renderHandCard(card)
    })
}

findCard = id => {
    return card = p1.hand.find(c => c.id === id)
}

renderFieldMonsters = cards => {
    fieldEl.innerHTML = ''
    cards.forEach(c => renderFieldMonster(c))
}

//Opponent helper functions 
removeFromOppFieldState = card => {
    p2.field = p2.field.filter(c => c !== card)
}

const oppFieldEl = document.querySelector('.opp-field')

renderOppFieldMonster = card => {
    cardImg = document.createElement('img')
    cardImg.src = card.image_url
    cardImg.id = card.id
    oppFieldEl.appendChild(cardImg)
    p2.field.push(card)
}

renderOppFieldMonsters = cards => {
    oppFieldEl.innerHTML = ''
    cards.forEach(c => renderOppFieldMonster(c))
}



//Attacking 
attackVattack = (myMonster, oppMonster) => {
    difference = myMonster.atk - oppMonster.atk
    if (difference > 0) {
        destroyOppMonster(oppMonster)
        p2.life -= difference
    } else if (difference < 0) {
        destroyMyMonster(myMonster)
        p1.life += difference
    } else {
        alert("Monsters have the same attack points. Nothing happens")
    }
    myLifeCounter.innerText = `Your Lifepoints: ${p1.life}`
    oppLifeCounter.innerText = `Oppostion Lifepoints: ${p2.life}`
}


const fieldEl = document.querySelector('.my-monsters')

fieldEl.addEventListener('click', e => {
    if (e.target.nodeName === "IMG") {
        myCard = p1.field.find(c => c.id === e.target.id)
        e.target.classList.toggle('atk-card')
        oppFieldEl.addEventListener('click', ev => {
            if (ev.target.nodeName === "IMG") {
                oppCard = p2.field.find(c => c.id === ev.target.id)
                attackVattack(myCard, oppCard)
                e.target.classList.toggle('atk-card')
            }
        })
    }

})

//Destroying monster 
destroyMyMonster = card => {
    removeFromFieldState(card)
    renderFieldMonsters(p1.field)
}

destroyOppMonster = card => {
    removeFromOppFieldState(card)
    renderOppFieldMonsters(p2.field)
}

//Draw card 
const deck = document.querySelector('#my-deck')

drawCard = () => {
    if (!p1.drawnCard) {
        card = p1.deck.pop()
        addToHandState(card)
        renderHandCard(card)
        p1.drawnCard = true
    } else {
        alert("You've already drawn a card this turn")
    }

}
deck.addEventListener('click', () => {
    drawCard()
})


//Play card 



renderFieldMonster = card => {
    cardImg = document.createElement('img')
    cardImg.src = card.image_url
    cardImg.id = card.id
    fieldEl.appendChild(cardImg)
}

playCard = card => {
    if (p1.turnSummonedMonsters < 2) {
        renderFieldMonster(card)
        addToFieldState(card)
        removeFromHand(card)
        renderHandCards(p1.hand)
        p1.turnSummonedMonsters += 1
    } else {
        alert("You've already summoned 2 monsters this turn")
    }

}

const handCards = document.querySelector('#my-hand')

handCards.addEventListener('click', e => {
    car = p1.hand.find(card => card.id == e.target.id)
    playCard(car)
})


let gamestate = []

function getGame(id) {
    fetch(`http://localhost:3000/api/v1/games/${id}`).then(function (response) { return response.json() }).then(game => getGameState(game))
}

function getGameState(game) { gamestate = game.gamestate }

let currentCard = null

function getCard(card_id) {
    fetch(`http://localhost:3000/api/v1/cards/${card_id}`).then(function (response) { return response.json() }).then(card => currentCard = card)
}


function updateGameState() {
    fetch(`http://localhost:3000/api/v1/games/${gamestate.game_id}`, {
        method: 'PUT',
        body: JSON.stringify(gamestate),
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => res.json())
        .then(response => console.log('Success:', JSON.stringify(response)))
        .catch(error => console.error('Error:', error));
}

function getMyDeck() {
    fetch(`http://localhost:3000/api/v1/decks/${gamestate.p1deckid}`).then(function (response) { return response.json() }).then(deck => loadDeck(deck, "me"))
}

function getOppDeck() {
    fetch(`http://localhost:3000/api/v1/decks/${gamestate.p2deckid}`).then(function (response) { return response.json() }).then(deck => loadDeck(deck, "opp"))
}

function loadDeck(deck, player) {
    if (player === "me") {
        deck1 = deck.cards
    } else {
        deck2 = deck.cards
    }
}

initialize = () => {
    startingHand()
    gameStart()

}

initialize() 