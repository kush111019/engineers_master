module.exports.recurringPayment = function (customerName,endDate) {
    let recurringTemp = `
    <!doctype html>
    <html lang="en-US">
    
    <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Payment reminder mail</title>
        <meta name="description" content="Payment reminder mail.">
        <style type="text/css">
            a:hover {text-decoration: underline !important;}
        </style>
    </head>
    
    <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
        <!--100% body table-->
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
            style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #fff; max-width:670px;  margin-top:25px; margin-bottom:25px; " width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="text-align:left; padding-top: 20px; padding-left: 50px;" >
                              <a href="http://143.198.102.134:8080/" title="logo" target="_blank">
                                <img src="https://www.engineermaster.in/images/hiriselogo.png" alt="logo" 
                                style=" width: 120px;">
                              </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                    style="max-width:670px;background:#fff; border-radius:3px; text-align:left;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="padding:0 35px;">

                                            <br style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            Hi ${customerName}, <br>
                                            <br/>

                                            This Email is to inform you that your subscription plan is going to expire on ${endDate}. 
                                            To continue the benefits of current subscription plan please pay your bill. <br>
                                            <br/>
                                            
                                            If you have any questions. Please email us at <a href=""
                                            style="text-decoration:none !important; font-weight:500; margin-top:30px; color: #1bb2cc; font-size:14px;padding:4px 4px;display:inline-block;"><u>Hirise@contactus.com</u></a><br>

                                            <br>
                                            Cheers,
                                            <br/>
                                            HiRise Team <br>
                                            </p>
                                            
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <!--/100% body table-->
    </body>
    
    </html>`

    return recurringTemp
}



