const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioAuthToken = process.env.TWILIO_PRIMARY_TOKEN;

const client = require('twilio')(twilioAccountSid, twilioAuthToken);

exports.handler = async (event, context) => {
    return verifyRequest(event, context);
};
function verifyRequest(event, context) {
    //This is where you would ensure that the request was legit, 
    //but we are using this instead for checking if we should just send
    //a sms or not based on env
    let request = context.awsRequestId;
    if (process.env.SEND_SMS == 'TRUE') {
        return sendCoverageDemo(event, request);
    } else {
        console.log(event);
        return 'We have received your request and this is your id: ' + request;
    }
}
function sendCoverageDemo(event, request) {
    let from = '+' + twilioPhoneNumber;
    let to = '+' + process.env.DEMO_JUDGE;

    let body = 'This is Cover Your Case with a new request:\n\n';

    body += 'Date: ' + event.Date + '\n';
    body += 'Time: ' + event.Time + '\n';
    body += 'Location: ' + event.Courtroom + ', '
        + event.Courthouse + ', ' + event.County + '\n';
    body += 'Judge: ' + event['Judge Name'] + '\n';

    //optional input but could be critical with picking up the case
    if (event['Any Extra Comments']) {
        body += 'Special Notes by the Requesting Attorney: ' +
            event['Any Extra Comments'] + '\n';
    }

    let obj = { from, to, body };
    return client.messages.create(obj)
        .then(d => {
            console.log(JSON.stringify(d));
            return 'We have received your request and this is your id: ' + request;
        })
        .catch(e => {
            console.error(e);
            return 'Failed request: ' + request
                + '.  Please contact Jeffrey S. Harris, Esq for more information';
        });

}