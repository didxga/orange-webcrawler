package com.orange.crawler.front.view;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.List;










import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import com.orange.crawler.utils.HTTPService;
import com.orange.crawler.utils.StringEx;



/**
 * Servlet implementation class PageServlet
 */
public class PageServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static Log log = LogFactory.getLog(PageServlet.class);  
    /**
     * @see HttpServlet#HttpServlet()
     */
    public PageServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doPost(request,response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		System.out.println("0");
		String url = request.getParameter("url");
		if (url == null || url.length() < 1) {
			try {
				//getResponse().sendError(404);
				System.out.println("4");
				response.sendError(404);
			} catch (IOException e) {
				log.error("", e);
			}
			return;
		}
		 
			HTTPService  httpService = new HTTPService();
			String html = httpService.readURL(url);
			System.out.println("1");
			if(html==null){response.sendError(404);System.out.println("2");}
			else{
				System.out.println("3");
		    html = convterHtml(url, html);
		    response.setContentType("text/html; charset=UTF-8");
		    response.addHeader("Access-Control-Allow-Origin", "*");
			response.getWriter().write(html);
			}
	}


	/**
	 * 杞寲html,鎶婄浉瀵硅矾寰勬敼鎴愮粷瀵硅矾寰�
	 * @param html
	 * @return
	 * @throws MalformedURLException 
	 */
	private String convterHtml(String baseUrl, String html) throws MalformedURLException {
		if(html==null){return null;}
		String h = html;
		URL _baseUrl = new URL(baseUrl);
		
		URL parseUrl = null;
		
		List<String> list = StringEx.subStrings(h, "href=\"", "\"");
		for (String item : list) {
			if (item.startsWith("http://")) {
				continue;
			}
			try {
				parseUrl = new URL(_baseUrl, item);
				h = h.replace("href=\"" + item + "\"", "href=\"" + parseUrl.toString() + "\"");
			} catch (Exception e) {}
		}
		list = StringEx.subStrings(h, "src=\"", "\"");
		for (String item : list) {
			if (item.startsWith("http://")) {
				continue;
			}
			try {
				parseUrl = new URL(_baseUrl, item);
				h = h.replace("src=\"" + item + "\"", "src=\"" + parseUrl.toString() + "\"");
			} catch (Exception e) {}
		}
		list = StringEx.subStrings(h, "action=\"", "\"");
		for (String item : list) {
			if (item.startsWith("http://")) {
				continue;
			}
			try {
				parseUrl = new URL(_baseUrl, item);
				h = h.replace("action=\"" + item + "\"", "action=\"" + parseUrl.toString() + "\"");
			} catch (Exception e) {}
		}
		 //h.replaceAll("document.domain=", "document.domain= \'localhost\';document.domain.originDomain=");
		// h.replaceAll("<//head>", "<script>document.domain= \'localhost\';<//script><//head>");
		 return h.replaceAll("document.domain=", "document.domain= \'123.127.237.161\';document.domain.originDomain=").replaceAll("</head>", "<script>document.domain= \'123.127.237.161\';</script></head>");
		//return h;
	}
}
