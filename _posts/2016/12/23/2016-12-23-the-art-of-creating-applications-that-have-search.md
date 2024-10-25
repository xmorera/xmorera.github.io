---
layout: post
title: "The Art of Creating Applications That Have Search"
date: 2016-12-23 00:00:00 -0600
categories: Post
---

# The Art of Creating Applications That Have Search

In my Pluralsight trainings, Getting Started with Enterprise Search using Apache Solr and Implementing Search in .NET Applications, one of the things that I make quite a bit of emphasis is on how important search is, yet it is one of the most misunderstood functions of IT and development in general. In this post I will show you an example of how a potentially good app is a pretty bad app mainly because of its search capabilities.

It is so much the case that in Twitter Pluralsight selected this phrase to tweet about the release of my course as you can see here:

searchiseverywhere

But now let’s get to the sample. Here’s the scenario:

Problem: Life is busy. No time to go to the supermarket

Solution: use your grocery store’s web site to purchase your food and it gets delivered home the next day. Charming idea, did not work with Webvan, but it seems to be doing quite well for Amazon and in my home town one of the major supermarkets is doing it in a more controlled way with a good delivery service, all for $10. Not too scalable, but for a MVP it is ok. (Read Lean Startup if you don’t know what MVP is)

It may work or maybe not mainly because of a really bad user experience, but let me get to the point. UX is important! Never forget it!

You get to the app in https://www.automercado.co.cr/aam/showMain.do and they have mainly 4 sections as you can see here

auto

And here is what they are for:
– On the left they have a directory style organized by aisle. Grouping kind of works in my opinion if you are not too sure of what you want, but it is terribly slow and inefficient. They lose cookie points for this.

2014-07-02_0638

– Then in the middle they have a section where they display the products. This is very standard so it kind of goes through, however they lose cookie points again for having products without pictures or with very weird stretching. They are a supermarket, and a big one, so I am sure they can send a guy with an iPhone to take a quick picture.

2014-07-02_0637

– The cart has a problem which is that they do not actually display the product name, only the description. Who thought of this? Not even something as simple as a tooltip!

2014-07-02_0640

And then here is the deal breaker for me: BAD SEARCH! As mentioned in the post, search is one of the most misunderstood functionalities in IT. A lot of people make huge mistakes because search can be done with a database, which it can, but the end results sucks! And it did suck here.

Let me show you this. I want to look for “jabon dial” which means “Dial Soap”. So I just type “Jabon Dial”. Should work, right? It doesn’t! Look at the message: “No results found…”. Also I hate the CAPS. There may be 1 technical reason I can think of but it is pretty dumb.

2014-07-02_0646

But why? If you look closely there are 27 types of “Jabon Dial”, type only Dial

2014-07-02_0649

The problem lies here:
– The person that implemented this application had no knowledge of how search works, which is normal as search is pretty misunderstood.
– But humans don’t do search like engineers want. Having the user do a search exactly like the engineer wants is just lazy and ineffective.
– So engineers who created this probably went for a simple exact match in a database search
– This is a terrible user experience. I can bet the farm that Amazon would have closed its doors in the 1990s if they had such a bad search

How to fix it? Well, go learn how to use a search engine. And that’s why I created my course, Getting Started With Enterprise Search Using Apache Solr: http://www.pluralsight.com/training/Courses/TableOfContents/enterprise-search-using-apache-solr

Dec 23, 2016
