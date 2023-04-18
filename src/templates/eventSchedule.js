module.exports.eventSchedule = function(creatorName, eventName, meetLink, leadName, leadEmail, description, dateTime, timezone){
    let schedule = `
<!DOCTYPE html>
<html>

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Contact us</title>
    <meta name="description" content="Contact us.">
    <style type="text/css">
        a:hover {
            text-decoration: underline !important;
        }
    </style>
</head>

<body>
    <div style = width : "100%", text-align : "center">
    <table cellspacing="0" border="0" cellpadding="0" bgcolor="#ededed"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif; width: 100%;">
        <tr>
            <td>
                <table style="background-color: #ededed; max-width:670px;  margin-top:25px; margin-bottom:25px; padding: 25px;"
                    width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                    <tr align="left">
                        <td>
                            <a href="https://app1.hirisetech.com/" title="logo" target="_blank">
                                <img src=${process.env.TEMPLATE_LOGO} alt="logo" style=" width: 120px;margin-left: -10px;">
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style="margin-bottom: 10px;">Hi ${creatorName},</p>
                            <p style="margin-bottom: 10px;">A new event has been scheduled.</p>
                            <br />
                            <p style="margin-bottom: 10px;"><strong>Event Type:</strong> ${eventName}</p>
                            <p style="margin-bottom: 10px;"><strong>Invitee:</strong> ${leadName}</p>
                            <p style="margin-bottom: 10px;"><strong>Invitee Email:</strong> ${leadEmail}</p>
                            <p style="margin-bottom: 10px;"><strong>Event Date/Time:</strong> ${dateTime}</p>
                            <p style="margin-bottom: 10px;"><strong>Meeting Link:</strong>. 
                            <a
                                    href="${meetLink}", style="color: #007bff; text-decoration: none;">Join
                                    now</a></p>
                            <p style="margin-bottom: 10px;"><strong>Invitee Time Zone:</strong> ${timezone}</p>

                            <p style="margin-bottom: 10px;">${description}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    </div>
</body>

</html>` 

return schedule;
}
