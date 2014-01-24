#! /usr/bin/env ruby

require 'json'
require 'dbm'

def get_db
	db_file = ARGV[0]

	db = DBM::open(db_file, DBM::WRCREAT)

	return db
end

def update_db(db, jira_data)
	jira_data['issues'].each do |issue|
		key = issue['key']
		db[key] = issue.to_s
		puts "--#{key}"
	end
end

def test
	db = get_db
	file = File.open(ARGV[1])
	data = JSON::load(file)
	update_db(db, data)
	db.each_value do |k|
		puts k
	end
	db.close
end

test