state = {
    p1: {
        life: null,
        deck: [],
        hand: [],
        field: [],
        currentCard: null,
        drawnCard: false,
        turnSummonedMonsters: 0
    },
    p2: {
        life: null,
        deck: [],
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
        // /debugger
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

//End Turn 

const endTurnButton = document.querySelector('#end-turn')

endTurnButton.addEventListener('click', () => endTurn())

//Server stuff 

let gamestate = []

function getActiveGame(id) {
    return fetch(`http://localhost:3000/api/v1/games/${id}`).then(function (response) { return response.json() }).then(game => getGameState(game))
}

function getGame(id) {
    fetch(`http://localhost:3000/api/v1/games/${id}`).then(function (response) { return response.json() }).then(game => getGameState(game)).then(getMyDeck).then(getOppDeck).then(gameStart)
}

function getGameState(game) { gamestate = game.gamestate }

let currentCard = null

function getCard(card_id) {
    return fetch(`http://localhost:3000/api/v1/cards/${card_id}`).then(function (response) { return response.json() })
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
    fetch(`http://localhost:3000/api/v1/decks/${gamestate.p1deckid}`).then(function (response) { return response.json() }).then(deck => loadDeck(deck, "me")).then(startingHand)
}

function getOppDeck() {
    fetch(`http://localhost:3000/api/v1/decks/${gamestate.p2deckid}`).then(function (response) { return response.json() }).then(deck => loadDeck(deck, "opp"))
}

function loadDeck(deck, player) {
    if (player === "me") {
        p1.deck = deck.cards
    } else {
        p2.deck = deck.cards
    }
}

function cardConverter(cards) {
    cardArray = []
    for (card of cards) {
        cardArray.push(card.id)
    }
    return cardArray
}

function cardDeconverter(cardIds, array) {
    // cardArray = []
    if (cardIds) {
        for (card of cardIds) {
            getCard(card).then(card => array.push(card))
        }
        console.log("HELP!")
    }
    // return cardArray
}

function endTurn() {
    gamestate.p1life = p1.life
    gamestate.p2life = p2.life
    gamestate.turn = gamestate.player2_id
    gamestate.p1deck = cardConverter(p1.deck)
    gamestate.p2deck = cardConverter(p2.deck)
    gamestate.p1hand = cardConverter(p1.hand)
    gamestate.p2hand = cardConverter(p2.hand)
    gamestate.p1field = cardConverter(p1.field)
    gamestate.p2field = cardConverter(p2.field)
    updateGameState()
}

function startTurn() {
    getActiveGame(1).then(() => {
        p1.life = gamestate.p1life
        p2.life = gamestate.p2life
        gamestate.turn = gamestate.player1_id
        p1.deck = []
        cardDeconverter(JSON.parse(gamestate.p1deck), p1.deck)
        // debugger
        p2.deck = []
        cardDeconverter(JSON.parse(gamestate.p2deck), p2.deck)
        p1.hand = []
        cardDeconverter(JSON.parse(gamestate.p1hand), p1.hand)
        p2.hand = []
        cardDeconverter(JSON.parse(gamestate.p2hand), p2.hand)
        p1.field = []
        cardDeconverter(JSON.parse(gamestate.p1field), p1.field)
        p2.field = []
        cardDeconverter(JSON.parse(gamestate.p2field), p2.field)
        p1.turnSummonedMonsters = 0
        p1.drawnCard = false
        renderHandCards(p1.hand)
        renderFieldMonsters(p1.field)
        renderOppFieldMonsters(p2.field)
    })
}

initialize = () => {
    getGame(1)
    //debugger
    //getMyDeck()
    //getOppDeck()

    startingHand()
    gameStart()

}

initialize() 