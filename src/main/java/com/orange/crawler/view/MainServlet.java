package com.orange.crawler.view;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.orange.crawler.bean.Picture;
import com.orange.crawler.service.BaseService;
import com.orange.crawler.service.impl.BaseServiceImp;

/**
 * Servlet implementation class MainServlet
 */
public class MainServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final Log log = LogFactory.getLog(MainServlet.class);
	private BaseService bs = new BaseServiceImp();
    /**
     * Default constructor. 
     */
    public MainServlet() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		if (log.isTraceEnabled())
			log.trace(String.format("doGet(%s, %s)", request, response));
		String parameter = request.getParameter("countryCode");
		response.setContentType("text/plain");
		List<Picture> pics = bs.getContentByCountryCode(parameter);
		JSONArray json = null ;
		try {
			json = new JSONArray();
			for(Picture pic: pics){
				    JSONObject jsonObject = new JSONObject();
					jsonObject.put("image", pic.getImage());
					jsonObject.put("link", pic.getLink());
					jsonObject.put("source", pic.getCountry());
					jsonObject.put("url", pic.getUrl());
					jsonObject.put("path", pic.getPath());	
					json.put(jsonObject);
			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		response.setCharacterEncoding("UTF-8");
		System.out.println(json.toString());
		response.getWriter().write(json.toString());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request,response);
	}

}
