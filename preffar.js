Quotes = new Meteor.Collection('quotes');

if (Meteor.isClient) {
    Template.addStock.events({
        'submit .addStock': function (e) {
            e.preventDefault();
            
            Quotes.insert({
                symbol: e.target.stockName.value
            });
            
            console.log('inserted to collection', Quotes.find().fetch());
            
            /*Meteor.call('searchForStock', e.target.stockName.value, function(error, result) {
                if(error) {
                    console.log('Ooops:', error);
                    return;
                }
                console.log(result.content);
            });*/
        }
    });
    
    Template.updateDataFromYahoo.events({
        'submit .updateDataFromYahoo': function(e) {
            e.preventDefault();
            var quotes = Quotes.find();
            quotes.forEach(function(q) {
                console.log('Calling server with value:', q);
                Meteor.call('updateData', q);
            });
        }
    });
    
    
    Template.quotes.helpers({
        quote: function() {
            return Quotes.find();
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
    // code to run on server at startup

    });
    
    Meteor.methods({
        searchForStock: function(str) {
            //this.unblock();
            var url = 'http://autoc.finance.yahoo.com/autoc?query=' + encodeURIComponent(str) + '&callback=YAHOO.Finance.SymbolSuggest.ssCallback';
            return HTTP.get(url);
        },
        updateData: function(q) {
            console.log('On server with value:', q.symbol);
            
            // OBS: use QUOTES for more data
            var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20%3D%20%22' + encodeURIComponent(q.symbol)+ '%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='; 
            HTTP.get(url, function(error, result) {
                //console.log(result);
                if(result && result.data.query && result.data.query.results) {
                    console.log(result.data.query.results);
                    //Quotes.update(q.id, {$set: result.data.query.results});
                    Quotes.update(q.id, {$set: {name: result.data.query.results.quote.name}});
                }
                
                //
            });
        }
    });
}

