var Quotes = Quotes || new Meteor.Collection('quotes');
// TODO: add calculated values (https://www.google.se/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=meteor%20collection%20calculated%20values)

if (Meteor.isClient) {
    Template.addStock.events({
        'submit .addStock': function (e) {
            e.preventDefault();
            
            var qId = Quotes.insert({
                symbol: e.target.stockName.value
            });
            
            e.target.stockName.value = "";
            
            //console.log('Calling update with id:', qId);
            
            Meteor.call('updateData', qId);
        }
    });
    
    Template.updateDataFromYahoo.events({
        'submit .updateDataFromYahoo': function(e) {
            e.preventDefault();
            var quotes = Quotes.find();
            quotes.forEach(function(q) {
                //console.log('Calling server with value:', q);
                Meteor.call('updateData', q._id);
            });
        }
    });
    
    Template.quotes.events({
       'click .removeStock': function(e) {
           Meteor.call('removeStock', this._id);
        },
        'click .removeDivident': function(e) {
            Meteor.call('removeDivident', this.dividentAmount, this.dividentDate);
        },
        'submit .addDivident': function(e) {
            e.preventDefault();
            Meteor.call('addDivident', this._id, e.target.dividentDate.value, e.target.dividentAmount.value);
        }
    });
    
    
    Template.quotes.helpers({
        quote: function() {
            return Quotes.find();
        }
    });
    
    Template.quotes.rendered = function() {
        console.log('rendered', this);
        $('.dateControl').datepicker({
            format: 'yyyy-mm-dd',
            startDate: '+1d',
            calendarWeeks: true,
            language: 'sv-SE',
            todayBtn: true,
            todayHighlight: true,
            weekStart: 1
        });
    }
}

if (Meteor.isServer) {
    Meteor.startup(function () {
    // code to run on server at startup

    });
    
    Meteor.methods({
        /*searchForStock: function(str) {
            //this.unblock();
            var url = 'http://autoc.finance.yahoo.com/autoc?query=' + encodeURIComponent(str) + '&callback=YAHOO.Finance.SymbolSuggest.ssCallback';
            return HTTP.get(url);
        },*/
        updateData: function(qId) {
            console.log('updateData:', qId);
            var symbol = Quotes.findOne(qId).symbol;
            console.log('found symbol:', symbol);
            
            // OBS: use QUOTES for more data
            var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20%3D%20%22' + encodeURIComponent(symbol)+ '%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='; 
            console.log(url);
            HTTP.get(url, function(error, result) {
                if(error) {
                    console.log('Error for symbol ' + symbol, error);
                    //Quotes.remove(qId);
                    return;
                }
                //console.log(error, result);
                if(result && result.data.query && result.data.query.results) {
                    console.log('Success for symbol:', symbol);
                    Quotes.update(qId, {$set: result.data.query.results.quote});
                }
            });
        },
        removeStock: function(id) {
            Quotes.remove(id);
        },
        removeDivident: function(dividentAmount, dividentDate) {
            var x = Quotes.update(
                { }, 
                { $pull: { dividents: { dividentAmount : dividentAmount, dividentDate : dividentDate } } },
                { multi: true }
            );
        },
        addDivident: function(id, dividentDate, dividentAmount) {
            Quotes.update(
                { _id: id },
                { $push: { dividents: { dividentAmount: dividentAmount, dividentDate: dividentDate } } }
            );
        }
    });
}

