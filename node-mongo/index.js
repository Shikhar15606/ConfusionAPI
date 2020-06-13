const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017/';
const dbname = 'conFusion';

MongoClient.connect(url, (err, client) => {
    // note that we need to run mongod in terminal to make this code work properly
    // note the callback to ensure that insertion and other operations are done only after the connection is made
    // assert.equal(err,null); is used to check for any errors
    assert.equal(err,null);
    //if no error is there then it will print this 
    console.log('Connected correctly to server');

    const db = client.db(dbname);
    const collection = db.collection("dishes");

    collection.insertOne({"name": "Uthappizza", "description": "test"},
    (err, result) => {
        //note the callback to ensure that "after insert" is printed only after the document is inserted
        assert.equal(err,null);

        console.log("After Insert:\n");
        console.log(result.ops);//to print the number of operations performed
        //find operation inside the callback of insertOne to ensure that finding is done only after insertion
        collection.find({}).toArray((err, docs) => {
            assert.equal(err,null);
            
            console.log("Found:\n");
            console.log(docs);

            db.dropCollection("dishes", (err, result) => {
                assert.equal(err,null);

                client.close();
            });
        });
    });

});