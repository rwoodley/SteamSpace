/*
 * Copyright Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

using Google.Apis.Oauth2.v2;
using Google.Apis.Oauth2.v2.Data;
using Google.Apis.Util;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IdentityModel.Selectors;
using System.IdentityModel.Tokens;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Compilation;
using System.Web.Routing;
using System.Web.SessionState;

namespace SimpleSpellingBot
{
    // based on the code found here: 
    public partial class SignIn : System.Web.UI.Page, IHttpHandler, IRequiresSessionState
    {
        // Get this from your app at https://code.google.com/apis/console
        static public string CLIENT_ID = "162790104805-bq78951i6h5mk51e164ghtdldndvut9h.apps.googleusercontent.com";

        /// <summary>
        /// Processes the request based on the path.
        /// </summary>
        /// <param name="context">Contains the request and response.</param>
        public void ProcessRequest(HttpContext context)
        {
            try
            {
                // Get the code from the request POST body.
                string accessToken = context.Request.Params["access_token"];
                string idToken = context.Request.Params["id_token"];

                // Validate the ID token
                if (idToken != null)
                {
                    JwtSecurityToken token = new JwtSecurityToken(idToken);
                    JwtSecurityTokenHandler jsth = new JwtSecurityTokenHandler();

                    // Configure validation
                    Byte[][] certBytes = getCertBytes();
                    Dictionary<String, X509Certificate2> certificates = new Dictionary<String, X509Certificate2>();

                    for (int i = 0; i < certBytes.Length; i++)
                    {
                        if (certBytes[i] == null) break;
                        X509Certificate2 certificate = new X509Certificate2(certBytes[i]);
                        certificates.Add(certificate.Thumbprint, certificate);
                    }
                    {
                        // Set up token validation
                        TokenValidationParameters tvp = new TokenValidationParameters()
                        {
                            ValidateActor = false, // check the profile ID

                            ValidAudience = CLIENT_ID,

                            ValidateIssuer = true, // check token came from Google
                            ValidIssuers = new List<string> { "accounts.google.com", "https://accounts.google.com" },

                            ValidateIssuerSigningKey = true,
                            RequireSignedTokens = true,
                            //CertificateValidator = X509CertificateValidator.None,
                            IssuerSigningKeyResolver = (s, securityToken, identifier, parameters) =>
                            {
                                return identifier.Select(x =>
                                {
                                    // TODO: Consider returning null here if you have case sensitive JWTs.
                                    /*if (!certificates.ContainsKey(x.Id))
                                    {
                                        return new X509SecurityKey(certificates[x.Id]);
                                    }*/
                                    if (certificates.ContainsKey(x.Id.ToUpper()))
                                    {
                                        return new X509SecurityKey(certificates[x.Id.ToUpper()]);
                                    }
                                    return null;
                                }).First(x => x != null);
                            },
                            ValidateLifetime = true,
                            RequireExpirationTime = true,
                            ClockSkew = TimeSpan.FromHours(13)
                        };

                        try
                        {
                            // Validate using the provider
                            SecurityToken validatedToken;
                            ClaimsPrincipal cp = jsth.ValidateToken(idToken, tvp, out validatedToken);
                        }
                        catch (Exception e)
                        {
                        }
                    }

                    // Get email
                    Claim[] claims = token.Claims.ToArray<Claim>();
                    String email = "";
                    String name = "";
                    for (int i = 0; i < claims.Length; i++)
                    {
                        if (claims[i].Type.Equals("email"))
                            email = claims[i].Value;
                        if (claims[i].Type.Equals("name"))
                            name = claims[i].Value;
                    }
                    Tuple<int, int> ids = DBHelper.getClassIdForEmail(email, name);
                    int teacherId = ids.Item1;
                    int classId = ids.Item2;
                    Debug.WriteLine("**** class id = " + classId);
                    Session["ClassID"] = classId;
                    Session["TeacherID"] = teacherId;
                    if (classId > 0)
                    {
                        context.Response.StatusCode = 200;
                        context.Response.ContentType = "text/json";
                        context.Response.Write("[]");
                    }
                    else
                    {
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "text/json";
                        context.Response.Write("[]");
                    }
                }
            }
            catch (Exception e)
            {
                Debug.Write(e.Message);
                Debug.Write(e.StackTrace);
                context.Response.StatusCode = 500;
                context.Response.StatusDescription = e.Message;
            }
        }

        // Used for string parsing the Certificates from Google
        private const string beginCert = "-----BEGIN CERTIFICATE-----\\n";

        private const string endCert = "\\n-----END CERTIFICATE-----\\n";

        /// <summary>
        /// Retrieves the certificates for Google and returns them as byte arrays.
        /// </summary>
        /// <returns>An array of byte arrays representing the Google certificates.</returns>
        public byte[][] getCertBytes()
        {
            // The request will be made to the authentication server.
            WebRequest request = WebRequest.Create(
                "https://www.googleapis.com/oauth2/v1/certs"
            );

            StreamReader reader = new StreamReader(request.GetResponse().GetResponseStream());

            string responseFromServer = reader.ReadToEnd();

            String[] split = responseFromServer.Split(':');

            // Supposedly, there are two certificates returned from Google, but sometimes there are more... I've seen 3. weird.
            byte[][] certBytes = new byte[4][];
            int index = 0;
            UTF8Encoding utf8 = new UTF8Encoding();
            for (int i = 0; i < split.Length; i++)
            {
                if (split[i].IndexOf(beginCert) > 0)
                {
                    int startSub = split[i].IndexOf(beginCert);
                    int endSub = split[i].IndexOf(endCert) + endCert.Length;
                    certBytes[index] = utf8.GetBytes(split[i].Substring(startSub, endSub).Replace("\\n", "\n"));
                    index++;
                }
            }
            return certBytes;
        }
    }
}