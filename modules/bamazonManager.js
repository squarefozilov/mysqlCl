var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');
var connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon"
});
 


function afterConnection() {
    connection.query("SELECT * FROM products ", function(err, results) {
    if (err) throw err;
    console.table(results);
    console.log("-----------------------------------------------------------")
    afterLoading();
  });
}

function lowStockProducts() {    
    var query = connection.query("SELECT * FROM products WHERE stock_quantity <? ",["5"], function(err, res) {
      if (err) throw err;
      console.table(res);
      console.log("-----------------------------------------------------------")
      afterLoading();
    });
    // logs the actual query being run
    // console.log(query.sql);
  }


  function addInventory() {
	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Please enter the Item ID for stock_count update.',
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'Item quantity',
			filter: Number
		}
	]).then(function(input) {
		var item = input.item_id;
		var addQuantity = input.quantity;
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {item_id: item}, function(err, data) {
			if (err) throw err;
			if (data.length === 0) {
				console.log('Please select a valid Item ID.');
				addInventory();

			} else {
				var productData = data[0];
				//console.log('Updating Inventory...');
				var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity + addQuantity) + ' WHERE item_id = ' + item;
				// Update the inventory
				connection.query(updateQueryStr, function(err, data) {
					if (err) throw err;
                })
                
                afterConnection();
			}
        })
        

    })
    
}

function createNewProduct() {
	inquirer.prompt([
		{
			type: 'input',
			name: 'product_name',
			message: 'Please enter the new product name.',
		},
		{
			type: 'input',
			name: 'department_name',
			message: 'Which department does the new product belong to?',
		},
		{
			type: 'input',
			name: 'price',
			message: 'What is the price per unit?',
		 
		},
		{
			type: 'input',
			name: 'stock_quantity',
			message: 'How many items are in stock?',
			 
		}
	]).then(function(input) {
		console.log('Adding New Item: \n    product_name = ' + input.product_name + '\n' +  
									   '    department_name = ' + input.department_name + '\n' +  
									   '    price = ' + input.price + '\n' +  
									   '    stock_quantity = ' + input.stock_quantity);

		// Create the insertion query string
		var queryStr = 'INSERT INTO products SET ?';

		// Add new product to the db
		connection.query(queryStr, input, function (error, results, fields) {
			if (error) throw error;
			console.log('New product has been added to the inventory under Item ID ' + results.insertId + '.');
        });        
        afterConnection();
        
	})
}



afterLoading();

function afterLoading(){
    inquirer.prompt([
        {
            type: "list",
            name: "methods",
            choices: ["View Products for Sale", "View Low Inventory","Add to Inventory","Add New Product"],
            message: "Menu options"
        }
    ]).then(function(inquirerResponse){
        console.log(inquirerResponse.methods);
        var method = inquirerResponse.methods;
        if (method ==="View Products for Sale"){
            afterConnection();
        }
        if(method === "View Low Inventory"){
            lowStockProducts();
        }
        if(method === "Add to Inventory"){
            addInventory();
        }
        if(method === "Add New Product"){
            createNewProduct();
        }
    })
}



