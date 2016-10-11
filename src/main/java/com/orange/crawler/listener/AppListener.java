package com.orange.crawler.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import com.orange.crawler.task.CrawlerService;
import com.orange.crawler.task.PromotionScrapeScheduler;

/**
 * Application Lifecycle Listener implementation class AppListener
 *
 */
public class AppListener implements ServletContextListener {

    /**
     * Default constructor. 
     */
    public AppListener() {
        // TODO Auto-generated constructor stub
    }

	/**
     * @see ServletContextListener#contextDestroyed(ServletContextEvent)
     */
    public void contextDestroyed(ServletContextEvent arg0)  { 
    	CrawlerService.getInstance().clean();
    	PromotionScrapeScheduler.getInstance().stop();
    }

	/**
     * @see ServletContextListener#contextInitialized(ServletContextEvent)
     */
    public void contextInitialized(ServletContextEvent arg0)  { 

    	PromotionScrapeScheduler.getInstance().start();
    }
	
}
