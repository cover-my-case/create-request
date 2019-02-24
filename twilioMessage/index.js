exports.handler = async (event) => {

    //This is a demo for the judging but would later sort through intents
    console.log(event);

    return '<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Message>'
        + 'Thank you we will notify you shortly if the case has been assigned to you.'
        + '</Message></Response>';
};