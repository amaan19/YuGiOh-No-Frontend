URL = `10.218.5.104:3000`
const search = new URLSearchParams(window.location.search)
let player = search.get('player')
let otherPlayer = null
playerSelect = () => {
    if (player === "p1") {
        otherPlayer = state.p2
        player = state.p1
    } else {
        otherPlayer = state.p1
        player = state.p2
    }
}


state = {
    p1: {
        life: null,
        deck: [],
        deckId: null,
        hand: [],
        field: [],
        currentCard: null,
        drawnCard: false,
        turnSummonedMonsters: 0
    },
    p2: {
        life: null,
        deck: [],
        deckId: null,
        hand: [],
        field: [],
        currentCard: null,
        drawnCard: false,
        turnSummonedMonsters: 0
    },
    inplay: []
}

const myLifeCounter = document.querySelector('.my-lifepoints')
const oppLifeCounter = document.querySelector('.opp-lifepoints')

gameStart = () => {
    player.life = 4000
    otherPlayer.life = 4000
    myLifeCounter.innerText = `Your Lifepoints: ${player.life}`
    oppLifeCounter.innerText = `Oppostion Lifepoints: ${otherPlayer.life}`
}


//DISPLAYING CARDS 

//Hand
const handEl = document.querySelector('#my-hand')

//My Helper functions

addToHandState = card => {
    player.hand.push(card)
}

addToFieldState = card => {
    player.field.push(card)
    state.inplay.push(card)
}

removeFromHand = card => {
    player.hand = player.hand.filter(c => c !== card)
    renderHandCards(player.hand)
}

removeFromFieldState = card => {
    player.field = player.field.filter(c => c !== card)
}

startingHand = () => {
    for (let i = 0; i < 3; i++) {
        // /debugger
        card = player.deck.pop()
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

renderHandCards = newCards => {
    handCards.innerHTML = ''
    newCards.forEach(card1 => {
        console.log(card1)
        renderHandCard(card1)
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
    otherPlayer.field = otherPlayer.field.filter(c => c !== card)
}

const oppFieldEl = document.querySelector('.opp-field')

renderOppFieldMonster = card => {
    cardImg = document.createElement('img')
    cardImg.src = card.image_url
    cardImg.id = card.id
    oppFieldEl.appendChild(cardImg)
    otherPlayer.field.push(card)
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
        otherPlayer.life -= difference
    } else if (difference < 0) {
        destroyMyMonster(myMonster)
        player.life += difference
    } else {
        alert("Monsters have the same attack points. Nothing happens")
    }
    myLifeCounter.innerText = `Your Lifepoints: ${player.life}`
    oppLifeCounter.innerText = `Oppostion Lifepoints: ${otherPlayer.life}`
}


const fieldEl = document.querySelector('.my-monsters')

fieldEl.addEventListener('click', e => {
    if (e.target.nodeName === "IMG") {
        myCard = player.field.find(c => c.id === e.target.id)
        e.target.classList.toggle('atk-card')
        oppFieldEl.addEventListener('click', ev => {
            if (ev.target.nodeName === "IMG") {
                oppCard = otherPlayer.field.find(c => c.id === ev.target.id)
                attackVattack(myCard, oppCard)
                e.target.classList.toggle('atk-card')
            }
        })
    }

})

//Destroying monster 
destroyMyMonster = card => {
    removeFromFieldState(card)
    renderFieldMonsters(player.field)
}

destroyOppMonster = card => {
    removeFromOppFieldState(card)
    renderOppFieldMonsters(otherPlayer.field)
}

//Draw card 
const deck = document.querySelector('#my-deck')

drawCard = () => {
    if (!player.drawnCard) {
        card = player.deck.pop()
        addToHandState(card)
        renderHandCard(card)
        player.drawnCard = true
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
    if (player.turnSummonedMonsters < 2) {
        renderFieldMonster(card)
        addToFieldState(card)
        removeFromHand(card)
        renderHandCards(player.hand)
        player.turnSummonedMonsters += 1
    } else {
        alert("You've already summoned 2 monsters this turn")
    }

}

const handCards = document.querySelector('#my-hand')

handCards.addEventListener('click', e => {
    car = player.hand.find(card => card.id == e.target.id)
    playCard(car)
})

//End Turn 

const endTurnButton = document.querySelector('#end-turn')

endTurnButton.addEventListener('click', () => endTurn())

//Server stuff 

let gamestate = []

function getActiveGame(id) {
    return fetch(`http://${URL}/api/v1/games/${id}`).then(function (response) { return response.json() }).then(game => getGameState(game))
}

function getGame(id) {
    fetch(`http://${URL}/api/v1/games/${id}`).then(function (response) { return response.json() }).then(game => getGameState(game)).then(getMyDeck).then(getOppDeck).then(gameStart)
}

function getGameState(game) {
    gamestate = game.gamestate
    if (search.get("player") === "p1") {
        player.deckId = gamestate.p1deckid
        otherPlayer.deckId = gamestate.p2deckid
    } else {
        player.deckId = gamestate.p2deckid
        otherPlayer.deckId = gamestate.p1deckid
    }
}

let currentCard = null

function getCard(card_id) {
    return fetch(`http://${URL}/api/v1/cards/${card_id}`).then(function (response) { return response.json() })
}


function updateGameState() {
    fetch(`http://${URL}/api/v1/games/${gamestate.game_id}`, {
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
    fetch(`http://${URL}/api/v1/decks/${player.deckId}`).then(function (response) { return response.json() }).then(deck => loadDeck(deck, "me")).then(startingHand)
}

function getOppDeck() {
    fetch(`http://${URL}/api/v1/decks/${otherPlayer.deckId}`).then(function (response) { return response.json() }).then(deck => loadDeck(deck, "opp"))
}

function loadDeck(deck, user) {
    if (user === "me") {
        player.deck = deck.cards
    } else {
        otherPlayer.deck = deck.cards
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
    }
    // return cardArray
}

function endTurn() {
    if (search.get("player") === "p1") {
        gamestate.p1life = player.life
        gamestate.p2life = otherPlayer.life
        gamestate.turn = gamestate.player2_id
        gamestate.p1deck = cardConverter(player.deck)
        gamestate.p2deck = cardConverter(otherPlayer.deck)
        gamestate.p1hand = cardConverter(player.hand)
        gamestate.p2hand = cardConverter(otherPlayer.hand)
        gamestate.p1field = cardConverter(player.field)
        gamestate.p2field = cardConverter(otherPlayer.field)
    } else {
        gamestate.p1life = otherPlayer.life
        gamestate.p2life = player.life
        gamestate.turn = gamestate.player1_id
        gamestate.p1deck = cardConverter(otherPlayer.deck)
        gamestate.p2deck = cardConverter(player.deck)
        gamestate.p1hand = cardConverter(otherPlayer.hand)
        gamestate.p2hand = cardConverter(player.hand)
        gamestate.p1field = cardConverter(otherPlayer.field)
        gamestate.p2field = cardConverter(player.field)
    }

    updateGameState()
}

function startTurn() {
    getActiveGame(1).then(() => {
        (async function () {
            player.life = gamestate.p1life
            otherPlayer.life = gamestate.p2life
            gamestate.turn = gamestate.player1_id
            player.deck = []
            otherPlayer.deck = []
            player.hand = []
            otherPlayer.hand = []
            player.field = []
            otherPlayer.field = []
            if (search.get("player") === "p1") {
                debugger
                await cardDeconverter(JSON.parse(gamestate.p1deck), player.deck)
                await cardDeconverter(JSON.parse(gamestate.p2deck), otherPlayer.deck)
                await cardDeconverter(JSON.parse(gamestate.p1hand), player.hand)
                await cardDeconverter(JSON.parse(gamestate.p2hand), otherPlayer.hand)
                await cardDeconverter(JSON.parse(gamestate.p1field), player.field)
                await cardDeconverter(JSON.parse(gamestate.p2field), otherPlayer.field)
            } else {
                debugger
                await cardDeconverter(JSON.parse(gamestate.p2deck), player.deck)
                await cardDeconverter(JSON.parse(gamestate.p1deck), otherPlayer.deck)
                await cardDeconverter(JSON.parse(gamestate.p2hand), player.hand)
                await cardDeconverter(JSON.parse(gamestate.p1hand), otherPlayer.hand)
                await cardDeconverter(JSON.parse(gamestate.p2field), player.field)
                await cardDeconverter(JSON.parse(gamestate.p1field), otherPlayer.field)
            }
            player.turnSummonedMonsters = 0
            player.drawnCard = false
        })
    }).then(() => {
        renderHandCards(player.hand)
        renderFieldMonsters(player.field)
        renderOppFieldMonsters(otherPlayer.field)
        console.log("done!")
    })
}

initialize = () => {
    playerSelect()
    getGame(1)
    //debugger
    //getMyDeck()
    //getOppDeck()

    startingHand()
    gameStart()

}

initialize() 