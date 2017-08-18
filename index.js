"use strict";

var express = require('express');
var app     = express();

app.listen(3000);

app.set('port', (process.env.PORT || 5000));
//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
  var result = 'App is running'
  response.send(result);
}).listen(app.get('port'), function() {
  console.log('App is running, server is listening on port ', app.get('port'));
});


let MessagingHub = require('messaginghub-client');
let WebSocketTransport = require('lime-transport-websocket');
let Lime = require('lime-js');

let client = new MessagingHub.ClientBuilder()
.withIdentifier('competfacebook')
.withAccessKey('YnViQldQYlhuV1BhblpjOUNNMU8=')
.withTransportFactory(() => new WebSocketTransport())
.build();

client.connect()
.then(() => {

  console.log('BOT CONNECTADO!');

  //Toda mensagem que chegar vai ser logada no console
  client.addMessageReceiver((m) => true, (m) => {
    console.log(m);
    console.log(m.content.toLowerCase().trim());
    //Passa a execução para o proximo receiver.
    return true;
  });

  //Recebe todas as mensagens
  client.addMessageReceiver((m) => true, (m) => {
    let command = {
      "id": Lime.Guid(),
      "method": "get",
      "uri": "/buckets/" + encodeURIComponent(m.from.split('/')[0])
    };

    client.sendCommand(command)
    .then(userSession => {
      //console.log(userSession.resource.sessionState);
      //console.log(userSession.resource.sessionRating);
      if (m.type == 'text/plain' && m.content.toLowerCase().trim() == 'reset') {
        let command = {
          "id": Lime.Guid(),
          "method": "delete",
          "uri": "/buckets/" + encodeURIComponent(m.from.split('/')[0])
        };

        client.sendCommand(command);

        let message = {
          id: Lime.Guid(),
          type: 'text/plain',
          content: 'Reset',
          to: m.from
        };

        client.sendMessage(message);
      }
    })
    .catch((err) => {
      if (m.type == 'text/plain' && m.content.toLowerCase().trim() == 'começar') {
        let command = {
          "id": Lime.Guid(),
          "method": "delete",
          "uri": "/buckets/" + encodeURIComponent(m.from.split('/')[0])
        };

        client.sendCommand(command);

        let message = {
          id: Lime.Guid(),
          type: 'text/plain',
          content: 'Olá',
          to: m.from
        };

        client.sendMessage(message);
      }

      else{

        let message = {
          id: Lime.Guid(),
          type: 'text/plain',
          content: 'Obrigado pela mensagem! Responderemos em breve. Caso queira saber mais sobre as atividades do COMPET basta acessar o nosso site: https://compet.decom.cefetmg.br/',
          to: m.from
        };

        client.sendMessage(message);

        let command = {
          "id": Lime.Guid(),
          "method": "set",
          "uri": "/buckets/" + encodeURIComponent(m.from.split('/')[0]),
          "type": "application/json",
          "resource": {
            "sessionState": "PrimeiroContato"
          }
        };

        client.sendCommand(command);

      }
    });
  });
})
.catch((err) => console.error(err));;
