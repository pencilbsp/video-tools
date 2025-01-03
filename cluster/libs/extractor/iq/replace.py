script_file = open("libs/extractor/iq/cmd5x.js", "r")
string_file = open("libs/extractor/iq/string.txt", "r")

origin_script = script_file.read()
script_file.close()
replace_txt = string_file.read()
string_file.close()

replace_list = []
for i in replace_txt.strip().split('\n'):
    replace_list.append(i.split('|'))

retval = origin_script
for i in replace_list:
    retval = retval.replace('_qdb("0x%s")' % i[0], i[1].__repr__())

retval_script = open("libs/extractor/iq/cmd5x_modified.js", "w")
retval_script.write(retval)
retval_script.close()
