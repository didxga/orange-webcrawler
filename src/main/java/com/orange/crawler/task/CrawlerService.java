package com.orange.crawler.task;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.machinepublishers.jbrowserdriver.JBrowserDriver;
import com.machinepublishers.jbrowserdriver.ProxyConfig;
import com.machinepublishers.jbrowserdriver.ProxyConfig.Type;
import com.machinepublishers.jbrowserdriver.Settings;
import com.machinepublishers.jbrowserdriver.Timezone;
import com.orange.crawler.bean.Picture;
import com.orange.crawler.bean.Selector;
import com.orange.crawler.dao.PictureDao;
import com.orange.crawler.dao.SelectorDao;


public class CrawlerService  {
	 private static ProxyConfig  pc ;
	 private JBrowserDriver driver ;
     private PictureDao pictureDao  = new PictureDao();
     private SelectorDao selectorDao  = new SelectorDao();
     private ExecutorService executor =  Executors.newFixedThreadPool(4);
     
     private final static CrawlerService instance = new  CrawlerService();
     
     private CrawlerService(){init();}
     
     public final static CrawlerService getInstance() {
    	 return instance;
     }
     
	 public void init() {
	    	pc = new ProxyConfig(Type.HTTP,"10.193.250.16", 3128);
	    	 driver = new JBrowserDriver(Settings.builder().
				      timezone(Timezone.AMERICA_NEWYORK).build());
	    	// DesiredCapabilities capability = DesiredCapabilities.chrome();
	    	 //capability.setPlatform(Platform.LINUX); 
	    }
	 public void crawl(String url , String xPath,String code){
		 try{
		 System.out.println("====================url=======================" );
		 driver.get(url);
		 System.out.println("====================result=======================" );
		 System.out.println("===================="+xPath+"=======================" );
		 WebElement targetEl = driver.findElementByXPath(xPath);
		 System.out.println("====================found=======================" );
		 //List<WebElement> findElements = targetEl.findElements(By.tagName("li"));
		 List<Picture>  pics = new ArrayList<Picture>();
		 System.out.println("===================="+targetEl.getTagName()+"=======================" );
		 //Picture(int id, String name, String image, String link, String path,String url, String country)
		 String tagName = targetEl.getTagName();
		 if(tagName.equalsIgnoreCase("a")){
			 String href = targetEl.getAttribute("href");
			 WebElement img = targetEl.findElement(By.tagName("img"));
			 String src = null;
			 if(img!=null){
				  src = img.getAttribute("src");
			 }
			 String text = targetEl.getText();
			 pics.add(new Picture("",src,href,xPath,url,code));
			 pictureDao.insert(pics) ;
		 }
		 else{
			 throw new RuntimeException("wrong element");
		 }
		 } catch(Exception e) {
			 e.printStackTrace();
		 } finally {
		 //driver.close();
		 }
		 
	 }
	  
	 
	 public static void main(String args[]) {
		 CrawlerService.getInstance().crawl("https://dependencyci.com/", "/html/body/div[2]/div/div[4]/div[6]/div/div/div/a/img", "sn");
	 }
	 /**
	  * crawl content for configuration (URL + XPath) saved in database
	  */
	 public void crawl() {
		 String url = "";
		 List<Selector> selectors = selectorDao.findAll();
		 for(Selector selector : selectors) {
			 url = selector.getUrl();
			 System.out.println("====================1=======================" );
			 String[] paths = selector.getPaths();
			 if(url!=null && paths!=null && paths.length>0) {
				 System.out.println("====================2=======================" );
				 for(String path:paths) {
//					 executor.submit(new Runnable() {
//
//							@Override
//							public void run() {
					 			pictureDao.deleteByURLAndPath(url, path);
								System.out.println("====================crawling website " + selector.getUrl() + "=======================" );
								crawl(selector.getUrl(), path, "sn");
//							}
//							 
//						 });
				 }
			 }
			 
		 }
	 }
	 
	 public void clean() {
		 driver.quit();
	 }
}
