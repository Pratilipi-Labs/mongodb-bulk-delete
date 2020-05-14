# mongodb-bulk-delete

  

A configurable tool to delete records in bulk while in control.

  

## Installation

  

``` js

>  npm  i  mongodb-bulk-delete

```

  

## Usage

  

``` js

const  bulkDelete  =  require('mongodb-bulk-delete');

bulkDelete.configure({

	uri: 'mongodb://localhost:27017',

	db: 'test',

	collection: 'user',

	query: { userId: { $gt: 100 } },

	removalBatchSize: 100

});

(async () => {

	const  result  =  await  bulkDelete.initialise();

	console.log(result);

})();

```

  

## Example Output

```

Thu May 14 2020 22:36:06 GMT+0000 (Coordinated Universal Time) Connected successfully to server

  

Thu May 14 2020 22:36:06 GMT+0000 (Coordinated Universal Time) Getting total documents...

Thu May 14 2020 22:36:19 GMT+0000 (Coordinated Universal Time) Total Documents matching query: 4471381

  

Documents Deleted: 4471396 Progress: 100% Thu May 14 2020 22:51:56 GMT+0000 (Coordinated Universal Time)

Successfully completed!

  

{ documentsDeleted: 4471396, timeTaken: "15m 37s" }

```

### Note

The total number of matching documents at the start of the script and the total documents deleted might vary as  decords may be added/removed by other clients while the script is running. 
  

### Configs

|	Name	|	Config	|	Default	|
|-----------|-----------|-----------|
| `uri` | `'mongodb://localhost:27017'` | Standard [mongodb connection uri](https://stackedit.io/%5Bhttps://docs.mongodb.com/manual/reference/connection-string/%5D(https://docs.mongodb.com/manual/reference/connection-string/)) |
| `db` | | Database name |
| `collection` | | query object |
| `removalBatchSize` | `1000` | Number of documents deleted in a batch |  
  

## Things to ensure before running the script on a live production server

  

* proper indexes are in place to quickly get the total number of documents else it might bog down the database server

* the script runs at non-peak hours