export function verifikasiPembayaranOtaEmail(
  currentUserName: string,
  numberOfPendingTransactionOtaToIOM: string,
  numberOfUnpaidTransactionIOMToMa: string,
  linkToDaftarTagihanOta: string,
  linkToDaftarTagihanMa: string
) {
  return `<body style="box-sizing: border-box; margin: 0;">
  <title>
  </title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <div id="in2p" style="box-sizing: border-box; background-color: #f6f9fc;">
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="initial" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div id="ipt46" style="box-sizing: border-box; background: initial; background-color: initial; margin: 0px auto; max-width: 600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="its89" width="100%" bgcolor="initial" style="box-sizing: border-box; border-collapse: collapse; background: initial; background-color: initial; width: 100%;">
        <tbody id="ikz63c" style="box-sizing: border-box;">
          <tr id="iv0i5r" style="box-sizing: border-box;">
            <td id="idtom" align="center" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 0px; text-align: center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="initial" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div id="iepcq" style="box-sizing: border-box; background: initial; background-color: initial; margin: 0px auto; max-width: 600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="ihjxy" width="100%" bgcolor="initial" style="box-sizing: border-box; border-collapse: collapse; background: initial; background-color: initial; width: 100%;">
        <tbody id="i4poha" style="box-sizing: border-box;">
          <tr id="inuhwz" style="box-sizing: border-box;">
            <td id="it1zd" align="center" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 0 20px; text-align: center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="shadow-outlook" style="vertical-align:top;width:560px;" ><![endif]-->
              <div id="ioknp" class="mj-column-per-100 mj-outlook-group-fix shadow" style="box-sizing: border-box; box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 5px; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" id="i7ds7" valign="top" style="box-sizing: border-box; border-collapse: collapse; vertical-align: top;">
                  <tbody id="iv3vvo" style="box-sizing: border-box;">
                    <tr id="i4cflh" style="box-sizing: border-box;">
                      <td id="in7ux" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 20px 20px 0px 20px; word-break: break-word;">
                        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:560px;" width="560" bgcolor="#003399" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                        <div id="i68rm" style="box-sizing: border-box; background: #003399; background-color: #003399; margin: 0px auto; border-radius: 24px 24px 0px 0px; max-width: 560px;">
                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="i6h8x" width="100%" bgcolor="#003399" style="box-sizing: border-box; border-collapse: collapse; background: #003399; background-color: #003399; width: 100%; border-radius: 24px 24px 0px 0px;">
                            <tbody id="i1zo46" style="box-sizing: border-box;">
                              <tr id="ikz07n" style="box-sizing: border-box;">
                                <td id="iotyl" align="center" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 20px; text-align: center;">
                                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:520px;" ><![endif]-->
                                  <div id="izuvj" class="mj-column-per-100 mj-outlook-group-fix" style="box-sizing: border-box; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" id="iuv2i" valign="top" style="box-sizing: border-box; border-collapse: collapse; vertical-align: top;">
                                      <tbody id="inwhdi" style="box-sizing: border-box;">
                                        <tr id="iy7t16" style="box-sizing: border-box;">
                                          <td align="center" id="i2igb" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 10px 25px; word-break: break-word;">
                                            <div id="is4tk" style="box-sizing: border-box; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 700; line-height: 24px; text-align: center; color: #ffffff;">Notifikasi Pembayaran Bantuan Orang Tua Asuh
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <!--[if mso | IE]></td></tr></table><![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <!--[if mso | IE]></td></tr></table><![endif]-->
                      </td>
                    </tr>
                    <tr id="igzcs3" style="box-sizing: border-box;">
                      <td id="ifady" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 0px 20px 20px 20px; word-break: break-word;">
                        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:560px;" width="560" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                        <div id="iafos" style="box-sizing: border-box; background: #FFFFFF; background-color: #FFFFFF; margin: 0px auto; border-radius: 0px 0px 16px 16px; max-width: 560px;">
                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="iazru" width="100%" bgcolor="#FFFFFF" style="box-sizing: border-box; border-collapse: collapse; background: #FFFFFF; background-color: #FFFFFF; width: 100%; border-radius: 0px 0px 16px 16px;">
                            <tbody id="i9r9w6" style="box-sizing: border-box;">
                              <tr id="i7oa0i" style="box-sizing: border-box;">
                                <td id="ijhtk" align="center" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 20px 25px; text-align: center;">
                                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:510px;" ><![endif]-->
                                  <div id="i574e" class="mj-column-per-100 mj-outlook-group-fix" style="box-sizing: border-box; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" id="iiwr8" valign="top" style="box-sizing: border-box; border-collapse: collapse; vertical-align: top;">
                                      <tbody id="icoiw" style="box-sizing: border-box;">
                                        <tr id="i018kw" style="box-sizing: border-box;">
                                          <td align="left" id="i3jt3" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 10px 0px 10px 0px; word-break: break-word;">
                                            <div id="ixfvo" style="box-sizing: border-box; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 24px; text-align: left; color: #003A6E;">
                                              <p data-start="153" data-end="164" id="iyco0m" style="box-sizing: border-box; display: block; margin-top: 13px; margin-right: 0px; margin-bottom: 13px; margin-left: 0px;">Halo 
                                                <b id="i4kqx5" style="box-sizing: border-box;">${currentUserName}
                                                </b>,
                                              </p>
                                              <p data-start="166" data-end="238" id="inp5x4" style="box-sizing: border-box; display: block; margin-top: 13px; margin-right: 0px; margin-bottom: 13px; margin-left: 0px;">Email ini dikirim sebagai pengingat rutin untuk memeriksa pembayaran beserta buktinya yang telah masuk dari Orang Tua Asuh dalam program Bantuan Orang Tua Asuh. Saat ini, terdapat 
                                                <b id="ikfk7zc" style="box-sizing: border-box;">${numberOfPendingTransactionOtaToIOM}
                                                </b> pembayaran dari OTA yang perlu diverifikasi dan terdapat 
                                                <b id="iir7cjh" style="box-sizing: border-box;">${numberOfUnpaidTransactionIOMToMa} 
                                                </b>
                                                <span draggable="true" id="ipccqej" style="box-sizing: border-box;">Mahasiswa Asuh yang perlu dikirim uang bulanannya. </span>
                                              </p>
                                            </div>
                                          </td>
                                        </tr>
                                        <tr id="ik3a0m" style="box-sizing: border-box;">
                                          <td align="center" vertical-align="middle" id="iycnam-2" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 12px 30px; word-break: break-word;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" id="i4p3wm-2" style="box-sizing: border-box; border-collapse: separate; line-height: 100%;">
                                              <tbody id="inven4" style="box-sizing: border-box;">
                                                <tr id="ig81yl" style="box-sizing: border-box;">
                                                  <td align="center" bgcolor="#003399" role="presentation" valign="middle" id="ivnb3k-2" style="box-sizing: border-box; border-collapse: collapse; border: none; border-radius: 4px; cursor: auto; mso-padding-alt: 10px 25px; background: #003399;">
                                                    <a href="${linkToDaftarTagihanOta}" target="_blank" id="i4mvl2-2" style="box-sizing: border-box; display: inline-block; background: #003399; color: #ffffff; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: normal; line-height: 120%; margin: 0; text-decoration: none; text-transform: none; padding: 10px 25px; mso-padding-alt: 0px; border-radius: 4px;">Verifikasi Pembayaran Disini</a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr id="ilpsn7" style="box-sizing: border-box;">
                                          <td align="center" vertical-align="middle" id="itwonn" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 12px 30px; word-break: break-word;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" id="ipsfpw" style="box-sizing: border-box; border-collapse: separate; line-height: 100%;">
                                              <tbody id="i2m1v7" style="box-sizing: border-box;">
                                                <tr id="i1k3ah" style="box-sizing: border-box;">
                                                  <td align="center" bgcolor="#003399" role="presentation" valign="middle" id="iqqda2" style="box-sizing: border-box; border-collapse: collapse; border: none; border-radius: 4px; cursor: auto; mso-padding-alt: 10px 25px; background: #003399;">
                                                    <a href="${linkToDaftarTagihanMa}" target="_blank" id="ikrl0b" style="box-sizing: border-box; display: inline-block; background: #003399; color: #ffffff; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: normal; line-height: 120%; margin: 0; text-decoration: none; text-transform: none; padding: 10px 25px; mso-padding-alt: 0px; border-radius: 4px;">Lihat Mahasiswa yang Belum Dibayar</a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr id="int4j8" style="box-sizing: border-box;">
                                        </tr>
                                        <tr id="ij3is3" style="box-sizing: border-box;">
                                        </tr>
                                        <tr id="i3pvqc-2" style="box-sizing: border-box;">
                                        </tr>
                                        <tr id="iizy1n" style="box-sizing: border-box;">
                                        </tr>
                                        <tr id="i6jszh" style="box-sizing: border-box;">
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <!--[if mso | IE]></td></tr></table><![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <!--[if mso | IE]></td></tr></table><![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="initial" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div id="inhldj-2" style="box-sizing: border-box; background: initial; background-color: initial; margin: 0px auto; border-radius: 0px 0px 16px 16px; max-width: 600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="iy5pxg-2" width="100%" bgcolor="initial" style="box-sizing: border-box; border-collapse: collapse; background: initial; background-color: initial; width: 100%; border-radius: 0px 0px 16px 16px;">
        <tbody id="ihuca8" style="box-sizing: border-box;">
          <tr id="i7uo42" style="box-sizing: border-box;">
            <td id="ida61g-2" align="center" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 20px 0; text-align: center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div id="ifnkjl-2" class="mj-column-per-100 mj-outlook-group-fix" style="box-sizing: border-box; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" id="iqwv72-2" valign="top" style="box-sizing: border-box; border-collapse: collapse; vertical-align: top;">
                  <tbody id="icufed" style="box-sizing: border-box;">
                    <tr id="i2rol2" style="box-sizing: border-box;">
                      <td align="center" id="ignljf-2" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 10px 25px; word-break: break-word;">
                        <div id="ixsznp-2" style="box-sizing: border-box; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 24px; text-align: center; color: #8898aa;">
                          © 2025 Bantuan Orang Tua Asuh - IOM ITB.
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </div>
</body>
<style>
  @media only screen and (min-width: 480px) {
    .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }
  }
  @media only screen and (max-width: 479px) {
    table.mj-full-width-mobile {
      width: 100% !important;
    }
    td.mj-full-width-mobile {
      width: auto !important;
    }
  }
</style>`;
}