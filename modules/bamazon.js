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
    connection.query("SELECT * FROM products limit 10", function(err, results) {
        if (err) throw err;
        console.table(results);
        console.log("-----------------------------------------------------------");
        //console.log(" id | product_name | department_name | price | stock_quantity"  )  
        //console.log("|-----------------------------------------------------------");
        /* for(let i=0; i< results.length;i++){
        console.log("|  "+results[i].item_id + "  " + results[i].product_name +  "  "+results[i].department_name +"  " + "  "+ results[i].price + " $  " + results[i].stock_quantity+"|");
        console.log("|-----------------------------------------------------------|");
        } */
        getUserInput();
    });
}


afterConnection();
console.log("\n");

function getUserInput() {
    inquirer.prompt([
            // Here we create a basic text prompt.
            {
                type: "input",
                message: "ID of the product would like to buy\n",
                name: "id"
            },
            // Here we create a basic password-protected text prompt.
            {
                type: "input",
                message: "How many units of the product would like to buy\n",
                name: "item"
            },

        ])
        .then(function(inquirerResponse) {
            // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
            var itemID = inquirerResponse.id;
            var itemNum = inquirerResponse.item;
            console.log("---" + itemID + "--" + itemNum);
            console.log(" ID of the product " + itemID);
            console.log(" How many units of the product they would like to buy" + itemNum + " \n");
            // console.log("---"+ itemID + "--"+ itemNum);
            connection.query("SELECT * FROM products where item_id=" + itemID, function(err, results) {
                if (err) throw err;
                //console.log(results);
                var dataB = results[0].stock_quantity;
                console.table(dataB);

                if (dataB > itemNum) {
                    var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (dataB - itemNum) + ' WHERE item_id = ' + itemID;
                    // console.log('updateQueryStr = ' + updateQueryStr);
                    // Update the inventory
                    connection.query(updateQueryStr, function(err, data) {
                        if (err) throw err;
                        console.log("**************************************************************");
                        console.log('Your just Purchased  ' + results[0].product_name + " item number --" + itemNum);
                        console.log('Your oder been placed! Your total is $' + results[0].price * itemNum);
                        console.log("*****************************Bamazon***************************\n");
                    })
                    afterConnection();
                } else {
                    console.table("Insufficient quantity!/n")
                    afterConnection();
                }
            });
        });
}