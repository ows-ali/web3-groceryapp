
App = {
    loading: false,
    contracts: {},
  
    load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
      App.account = web3.eth.accounts[0]
    },
  
    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const groceryList = await $.getJSON('GroceryList.json')
      App.contracts.GroceryList = TruffleContract(groceryList)
      App.contracts.GroceryList.setProvider(App.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      App.groceryList = await App.contracts.GroceryList.deployed()
    },
  
    render: async () => {
      // Prevent double render
      if (App.loading) {
        return
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Render Account
      $('#account').html(App.account)
  
      // Render Tasks
      await App.renderTasks()
  
      // Update loading state
      App.setLoading(false)
    },
  
    renderTasks: async () => {
      // Load the total grocery count from the blockchain
      const groceryCount = await App.groceryList.groceryCount()
      const $groceryItemTemplate = $('.groceryItemTemplate')
  
      // Render out each groceryItem with a new groceryItem template
      for (var i = 1; i <= groceryCount; i++) {
        // Fetch the grocery data from the blockchain
        const groceryItem = await App.groceryList.groceryList(i)
        const groceryId = groceryItem[0].toNumber()
        const groceryContent = groceryItem[1]
        const groceryBought = groceryItem[2]
  
        // Create the html for the grocery Item
        const $newGroceryItemTemplate = $groceryItemTemplate.clone()
        $newGroceryItemTemplate.find('.content').html(groceryContent)
        $newGroceryItemTemplate.find('input')
                        .prop('name', groceryId)
                        .prop('checked', groceryBought)
                        .on('click', App.toggleBought)
  
        // Put the grocrey item in the correct list
        if (groceryBought) {
          $('#boughtGroceryList').append($newGroceryItemTemplate)
        } else {
          $('#groceryList').append($newGroceryItemTemplate)
        }
  
        // Show the task
        $newGroceryItemTemplate.show()
      }
    },
  
    createTask: async () => {
      App.setLoading(true)
      const content = $('#newTask').val()
      await App.groceryList.createTask(content)
      window.location.reload()
    },
  
    toggleCompleted: async (e) => {
      App.setLoading(true)
      const taskId = e.target.name
      await App.groceryList.toggleCompleted(taskId)
      window.location.reload()
    },
  
    setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    }
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })