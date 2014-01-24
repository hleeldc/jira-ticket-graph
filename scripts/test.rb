#! /usr/bin/env ruby

require 'json'
require 'pp'

ARGV.each do |filename|
	File.open(filename, 'r') do |file|
		h = JSON.load(file.read())
		h['issues'].each do |issue|
			project = issue['fields']['project']['key']
			key = issue['key']
			issue['fields']['worklog']['worklogs'].each do |log|
				author = log['author']['name']
				time_spent = log['timeSpentSeconds']
				created = log['created']
				puts "#{project}\t#{key}\t#{author}\t#{time_spent}\t#{created}"
			end
		end
	end
end