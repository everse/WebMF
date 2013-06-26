
	var socket = io.connect('Adams-MacBook-Pro.local:8084', {
		reconnect:true
	});
	socket.on('startedGameConnector', function(gameName){
		console.log("STARTED " + gameName);
	});
	socket.on('matchesChanged', function(data){
		console.log("matchesChanged " + data);
	});
	socket.on('disconnect', function(){
		console.log('got disconnected');
	});
function fetchGameConnectors(func){
	socket.emit('getConnectors');
	socket.on('gotConnectors', func);
}

(function(){

///
/// GameMonitor
///
var GameMonitor = Backbone.Model.extend({
  defaults: {
    name: '',
    running: false,
	playersInQueue: 0
  }
});

///
/// GameMonitorsCollection
///
var GameMonitorsCollection = Backbone.Collection.extend({
	model: GameMonitor,
	initialize: function (models,options) {
		var self = this;
		socket.on('playerQueueChanged', function(data){
			console.log("playerQueueChanged " + data);
			var monitorToChange = self.findWhere({name:data.game});
			monitorToChange.set('playersInQueue', data.playerQueue);
		});
	}
});
var GameMonitors = new GameMonitorsCollection;

///
/// GameMonitorView
///
var GameMonitorView = Backbone.View.extend({
	tagName: 'li',
	template: _.template($('#item-template').html()),
	initialize: function(){
		this.model.on('change', this.render, this);
	},
	render: function() {
	      this.$el.html(this.template(this.model.toJSON()));
	      return this;
	}
});

///
/// AppView
///
var AppView = Backbone.View.extend({
	el: $("#gamesMonitors"),
	initialize: function() {
		this.listenTo(GameMonitors, 'add', this.addOne);
		fetchGameConnectors(function(games){
			GameMonitors.set(games);
		});
	},
	addOne: function(monitors) {
		var view = new GameMonitorView({model: monitors});
		this.$el.append(view.render().el);
	}
});

var App = new AppView;

})();



