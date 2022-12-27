module.exports.resetPassword = function (link, email, userName) {
    let resetPass = `
    <!doctype html>
    <html lang="en-US">
    
    <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Reset Password Template</title>
        <meta name="description" content="Reset Password Template.">
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
                            <td style="text-align:left; padding-top: 20px; padding-left: 50px;">
                              <a href="http://143.198.102.134:8080/" title="logo" target="_blank">
                                <img src="https://hirisetech.com/img/core-img/logo.png" alt="logo" 
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
                                            Hello ${userName}, <br>
                                            <br/>
                                            <center> <img  src="https://hirisetech.com/img/core-img/eyes.png" alt="eyes" style="width: 5%;" > </center>
                                            <h4 style="text-align:center;">Password Reset</h4>


                                            Someone requested that the password be reset for the following account:<br>
                                            To reset your password, please click the below blue button <br>
                                             
                                            <a href= ${link} style="background:#4285f4;text-decoration:none !important; font-weight:500; margin-top:15px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:8px;">Click here to reset your password</a><br>
                                             <p>Your email:<a href="" style="color:#1bb2cc;"><u>${email}</u></a></p>
                                                <br>
                                             <p>If this was a mistake, then just ignore this email.</p>
                                            <br>
                                            Cheers,
                                            <br/>
                                            HiRise Team <br>

                                            <h5>If you have any questions. Please email us at <a style="color:#1bb2cc;"><u>Hirise@contactus.com</u></a>.</h5> 
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

    return resetPass
}



