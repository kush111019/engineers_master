module.exports.contactUs = function (email, fullName, subject, message, address) {
    let contact = `
    <!DOCTYPE html>
<html>
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Contact us</title>
    <meta name="description" content="Contact us.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>
  <body>
    <table cellspacing="0" border="0" cellpadding="0" bgcolor="#ededed"
            style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif; width: 100%;">
        <tr>
        <td>
          <table style="background-color: #ededed; max-width:670px;  margin-top:25px; margin-bottom:25px; padding: 25px;" width="100%" border="0"
          align="center" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <a href="http://143.198.102.134:8080/" title="logo" target="_blank">
              <img src="https://hirisetech.com/img/core-img/logo.png" alt="logo" 
              style=" width: 120px;">
            </a>
          </td>
      </tr>
      <tr align="left">
      <th style="width: 20%;">Name :</th>
      <td><p>${fullName}</p></td>
    
        </tr>
        <tr align="left">
        <th style="width: 20%;">Email :</th>
        <td><p>${email}</p></td>
        </tr>
        <tr align="left">
        <th style="width: 20%;">Address :</th>
        <td><p>${address}</p></td>
        </tr>
        <tr align="left">
          <th style="width: 20%;">Subject :</th>
          <td><p>${subject}</p></td>
        </tr>
        <tr align="left">
          <th style="width: 20%;"> Message :</th>
         <td> ${message}</td>
        </tr>
      </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

    return contact
}
