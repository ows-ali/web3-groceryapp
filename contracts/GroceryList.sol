pragma solidity ^0.5.0;

contract GroceryList {
    uint256 public groceryCount = 0;

    struct GroceryItem {
        uint256 id;
        string content;
        bool bought;
    }

  event GroceryItemCreated(
    uint id,
    string content,
    bool bought
  );

  event GroceryItemUpdated(
    uint id,
    bool bought
  );


    mapping (uint256=>GroceryItem) public groceryList;
    constructor() public {
        createItem("2 dozen eggs");
    }

    function createItem(string memory _content) public {
        groceryCount++;
        groceryList[groceryCount] = GroceryItem(groceryCount, _content, false);
        emit GroceryItemCreated(groceryCount, _content, false);

    }


    function toggleBought(uint _id) public {
        GroceryItem memory _groceryItem = groceryList[_id];
        _groceryItem.bought = !_groceryItem.bought;
        groceryList[_id] = _groceryItem;
        emit GroceryItemUpdated(_id, _groceryItem.bought);

    }

}
