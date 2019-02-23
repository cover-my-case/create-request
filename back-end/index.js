const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioAuthToken = process.env.TWILIO_PRIMARY_TOKEN;

const client = require('twilio');
const proactiveClient = client(twilioAccountSid, twilioAuthToken);
const MessagingResponse = client.twiml.MessagingResponse;

const querystring = require('querystring');

const address = require('./address');
exports.handler = async (event, context) => {
    if (event.params && event.params.header && event["body-json"]
        && event.params.header["User-Agent"] == "TwilioProxy/1.1") {
        return incomingSms(event, context);
    } else if (event.Date) {
        console.log(JSON.stringify(event));
        return verifyRequest(event, context);
    } else {
        console.log(event);
        return 'You have failed this city!!';
    }
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

    body += 'Requesting Attorney: ' + 'Jeffery S. Harris, Esq' + '\n';
    body += 'Date: ' + event.Date + '\n';
    body += 'Time: ' + event.Time + '\n';
    body += 'Location: ' + event.Courtroom + ', '
        + event.Courthouse + ', ' + event.County + '\n';

    //check to see if this exists
    if (address[event.Courthouse]) {
        body += 'Address: ' + address[event.Courthouse].address + '\n';
    }

    //optional input
    if (event['Judge Name']) {
        body += 'Judge: ' + event['Judge Name'] + '\n';
    }

    body += 'Case Name: ' + event['Case Name'] + '\n';

    //optional input but could be critical with picking up the case
    if (event.Instructions) {
        body += 'Special Notes by the Requesting Attorney: ' +
            event['Any Extra Comments'] + '\n';
    }

    let obj = { from, to, body };
    return proactiveClient.messages.create(obj)
        .then(d => {
            console.log(d);
            return 'We have received your request and this is your id: ' + request;
        })
        .catch(e => {
            console.error(e);
            return 'Failed request: ' + request
                + '.  Please contact Jeffrey S. Harris, Esq for more information';
        });

}
function incomingSms(event, context) {

    let json = querystring.parse(event["body-json"]);
    console.log(json);
    let body = json.Body;
    let text = '';

    //Add signature check
    //Add real NLP later
    if (typeof body == 'string') {
        let nBody = body.toLowerCase();
        if (nBody == 'accept') {
            text = 'Type YES if you have current Malpractice Insurance or '
                + 'NO if you do not have anything currently.';
        } else if (nBody == 'reject') {
            text = 'Sorry to hear that, I hope we can find you a different case in the future';
        } else if (nBody == 'yes') {
            text = 'Glad to hear that here is the rest of the details of the case.\n\n';
            text += 'Case Number: ' + 'abc1234567' + '\n';
            text += 'Division: ' + 'Civil' + '\n';
            text += 'Practice Area: ' + 'Collections' + '\n';
            text += 'Attachments: '
                + 'https://s3.amazonaws.com/griot-voice-assistant/daily-chinese-quiz/alexa-icons/large_icon.png'
                + '\n';
        } else if (nBody == 'no') {
            text = 'I am sorry but we cannot give you this case at this time.';
            text += '  But with 15 minutes you might be able to save 15% on your insurace';
        } else {
            text = 'I am sorry, I am not sure what you mean.';
        }
    } else {
        text = 'I am sorry, I am not sure what you mean.';
    }
    return sendSms(text);

}
function sendSms(text) {
    // const response = new MessagingResponse();
    // response.message(text);
    // return response.toString();

    let str = '<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Message>'
        + text
        + '</Message></Response>';
    return str;
}