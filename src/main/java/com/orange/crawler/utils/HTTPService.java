package com.orange.crawler.utils;

import java.io.IOException;

import org.apache.commons.lang.StringUtils;
import org.apache.http.Header;
import org.apache.http.HeaderElement;
import org.apache.http.HttpEntity;
import org.apache.http.HttpException;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpRequestInterceptor;
import org.apache.http.HttpResponse;
import org.apache.http.HttpResponseInterceptor;
import org.apache.http.HttpStatus;
import org.apache.http.HttpVersion;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.GzipDecompressingEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.params.ClientPNames;
import org.apache.http.client.params.HttpClientParams;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.params.ConnRoutePNames;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.cookie.Cookie;
import org.apache.http.cookie.CookieOrigin;
import org.apache.http.cookie.CookieSpec;
import org.apache.http.cookie.CookieSpecFactory;
import org.apache.http.cookie.MalformedCookieException;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.SingleClientConnManager;
import org.apache.http.impl.cookie.BrowserCompatSpec;
import org.apache.http.params.CoreProtocolPNames;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;




public class HTTPService {
    private String PROXY_SERVER_URL = "";
    private String PROXY_SERVER_PORT = "";
    private String SERVER_AUTH_USERNAME = "";
    private String SERVER_AUTH_PASSWORD = "";
    
	public HttpClient getSingleHttpClient(){
		final SchemeRegistry schemeRegistry = new SchemeRegistry();
		schemeRegistry.register(new Scheme("http", 80, PlainSocketFactory.getSocketFactory()));
		schemeRegistry.register(new Scheme("https", 443, SSLSocketFactory.getSocketFactory()));
		final ClientConnectionManager scm = new SingleClientConnManager(schemeRegistry);
		final DefaultHttpClient httpClient = new DefaultHttpClient(scm);
		initHttpClient(httpClient);
		return httpClient;
	}

	private void initHttpClient(DefaultHttpClient hc){
		hc.getParams().setParameter(CoreProtocolPNames.PROTOCOL_VERSION, HttpVersion.HTTP_1_1);
		hc.getParams().setParameter(CoreProtocolPNames.HTTP_CONTENT_CHARSET,"UTF-8");
		hc.getParams().setParameter(ClientPNames.HANDLE_REDIRECTS, false); 
		hc.getParams().setParameter(CoreProtocolPNames.USER_AGENT, "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Mobile/10A403");
		hc.addRequestInterceptor(new HttpRequestInterceptor() {
			public void process(final HttpRequest request, final HttpContext context) throws HttpException, IOException {
				if (!request.containsHeader("Accept-Encoding"))
					request.addHeader("Accept-Encoding", "gzip");
			}
		});
		hc.addResponseInterceptor(new HttpResponseInterceptor() {
			public void process(final HttpResponse response, final HttpContext context) throws HttpException, IOException {
				final HttpEntity entity = response.getEntity();
				if (entity != null) {
					final Header ceheader = entity.getContentEncoding();
					if (ceheader != null) {
						final HeaderElement[] codecs = ceheader.getElements();
						for (final HeaderElement element:codecs) {
							if (element.getName().equalsIgnoreCase("gzip")) {
								response.setEntity(new GzipDecompressingEntity(response.getEntity()));
								return;
							}
						}
					}
				}
			}
		});
		final CookieSpecFactory csf = new CookieSpecFactory(){
			public CookieSpec newInstance(HttpParams params){
                return new BrowserCompatSpec(){
                    @Override
                    public void validate(Cookie cookie, CookieOrigin origin) throws MalformedCookieException{
                   }
                };
            }
        };
        hc.getCookieSpecs().register("orange", csf);
		HttpClientParams.setCookiePolicy(hc.getParams(), "orange");
		if(StringUtils.isNotBlank(PROXY_SERVER_URL)&&StringUtils.isNotBlank(PROXY_SERVER_PORT)){
			final int port = Integer.valueOf(PROXY_SERVER_PORT);
			final HttpHost proxy = new HttpHost(PROXY_SERVER_URL, port);
			hc.getParams().setParameter(ConnRoutePNames.DEFAULT_PROXY, proxy);
			if(StringUtils.isNotBlank(SERVER_AUTH_USERNAME)&&StringUtils.isNotBlank(SERVER_AUTH_PASSWORD)){
				hc.getCredentialsProvider().setCredentials(new AuthScope(PROXY_SERVER_URL, port), new UsernamePasswordCredentials(SERVER_AUTH_USERNAME, SERVER_AUTH_PASSWORD));
			}
		}
	}
	
	public String readURL(String url) throws IOException {
		final HttpClient httpClient = getSingleHttpClient();
		try {
			final HttpGet httpGet = new HttpGet(url);
			httpGet.addHeader("Content-Type", "text/html;charset=UTF-8");
			final HttpResponse response = httpClient.execute(httpGet);
			if (HttpStatus.SC_OK == response.getStatusLine().getStatusCode()) {
				final HttpEntity entity = response.getEntity();
				final byte[] contentByteArray= EntityUtils.toByteArray(entity);
				final String contentStr=new String(contentByteArray,"UTF-8");
				//final String contentStr = EntityUtils.toString(entity);
				EntityUtils.consume(entity);
				return contentStr;
			}
		}finally {
			httpClient.getConnectionManager().shutdown();
		}
		return null;
	}

}

